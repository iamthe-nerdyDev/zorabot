// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { FunctionsClient } from '@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol';
import { ConfirmedOwner } from '@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol';
import { FunctionsRequest } from '@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol';
import { AccessControl } from '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract ZorlifyPricePredictions is
  FunctionsClient,
  ConfirmedOwner,
  AccessControl,
  ReentrancyGuard
{
  using FunctionsRequest for FunctionsRequest.Request;
  using Strings for *;
  using SafeERC20 for IERC20;

  string public source =
    'const address = args[0];'
    'const chain = 8453;'
    'const url = `https://api-sdk.zora.engineering/coin`;'
    'const request = Functions.makeHttpRequest({url,'
    'params: { address, chain },'
    '});'
    'const response = await request;'
    'if (response.error) {'
    "throw Error('Request failed');"
    '}'
    'const usdcDecimals = 6;'
    "const token = response['data']['zora20Token'];"
    "const tokenName = token['name'];"
    "const price = token['tokenPrice']['priceInUsdc'];"
    'return Functions.encodeUint256(Math.round(Number(price) * 10 ** usdcDecimals));';

  address public router;
  bytes32 public donId;
  uint64 public subscriptionId;
  uint32 public gasLimit = 300000;

  bytes32 public constant CREATOR_ROLE = keccak256('CREATOR_ROLE');

  enum MarketOutcome {
    UNRESOLVED,
    YES,
    NO
  }

  struct Request {
    uint256 marketId;
    bool fulfilled;
    bool exists;
    bytes response;
    bytes error;
  }

  struct Market {
    address token;
    address creator;
    IERC20 bettingToken;
    uint256 targetPrice;
    bool targetIsAboveTargetPrice;
    MarketOutcome outcome;
    uint256 endTs;
    bytes32 requestId;
    uint256 totalYesShares;
    uint256 totalNoShares;
    bool resolved;
    mapping(address usr => uint256 amount) noSharesBalance;
    mapping(address usr => uint256 amount) yesSharesBalance;
    mapping(address usr => bool status) hasClaimed;
  }

  uint16 public constant BPS = 10000;
  uint16 public feeBps;
  address feeAddress;

  bytes32 public s_lastRequestId;
  bytes public s_lastResponse;
  bytes public s_lastError;

  uint256 public marketCount;
  mapping(bytes32 requestId => Request request) public requests;
  mapping(uint256 marketId => Market market) public markets;

  event MarketCreated(
    uint256 indexed marketId,
    address indexed creator,
    address indexed token,
    uint256 targetPrice,
    bool targetIsAboveTargetPrice,
    uint256 endTs
  );

  event SharesPurchased(
    uint256 indexed marketId,
    address indexed usr,
    bool isYes,
    uint256 amount,
    uint256 fee
  );

  event MarketResolved(uint256 indexed marketId, MarketOutcome outcome);

  event Claimed(uint256 indexed marketId, address indexed usr, uint256 amount);

  error InvalidMarketId();
  error InvalidRequestId();
  error MarketAlreadyResolved();
  error MarketNotResolved();
  error MarketTradingHasEnded();
  error MarketHaveNotEnded();
  error NoWinnings();
  error AlreadyClaimed();
  error InvalidAddress();

  modifier validMarket(uint256 marketId) {
    if (marketId >= marketCount) revert InvalidMarketId();
    _;
  }

  constructor(
    address _router,
    bytes32 _donId,
    uint64 _subscriptionId,
    uint16 _feeBps,
    address _feeAddress
  ) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
    require(_feeAddress != address(0), 'Invalid fee address');
    require(_feeBps <= 1000, 'Fee too high'); // -- max 10%

    router = _router;
    donId = _donId;
    subscriptionId = _subscriptionId;
    feeBps = _feeBps;
    feeAddress = _feeAddress;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function _fee(uint256 amount) internal view returns (uint256 fee) {
    fee = (amount * feeBps) / BPS;
  }

  function _decodePrice(bytes memory response) internal pure returns (uint256 price) {
    price = abi.decode(response, (uint256));
  }

  function createMarket(
    address _token,
    address _bettingToken,
    uint256 _targetPrice,
    bool _targetIsAboveTargetPrice,
    uint256 _endTs
  ) external onlyRole(CREATOR_ROLE) returns (uint256 marketId) {
    if (_token == address(0)) revert InvalidAddress();
    if (_bettingToken == address(0)) revert InvalidAddress();

    require(_endTs > block.timestamp, 'End time must be in the future');
    require(_targetPrice > 0, 'Target price must be greater than 0');

    marketId = marketCount++;
    Market storage market = markets[marketId];

    market.token = _token;
    market.bettingToken = IERC20(_bettingToken);
    market.creator = msg.sender;
    market.targetPrice = _targetPrice;
    market.targetIsAboveTargetPrice = _targetIsAboveTargetPrice;
    market.endTs = _endTs;
    market.outcome = MarketOutcome.UNRESOLVED;

    emit MarketCreated(
      marketId,
      msg.sender,
      _token,
      _targetPrice,
      _targetIsAboveTargetPrice,
      _endTs
    );
  }

  function buyShares(
    uint256 marketId,
    bool isYes,
    uint256 amount
  ) external validMarket(marketId) nonReentrant {
    Market storage market = markets[marketId];
    if (block.timestamp > market.endTs) revert MarketTradingHasEnded();
    if (market.resolved) revert MarketAlreadyResolved();
    require(amount > 0, 'Amount must be positive');

    market.bettingToken.safeTransferFrom(msg.sender, address(this), amount);

    uint256 fee = _fee(amount);
    uint256 net = amount - fee;
    if (fee > 0) market.bettingToken.safeTransfer(feeAddress, fee);

    if (isYes) {
      market.yesSharesBalance[msg.sender] += net;
      market.totalYesShares += net;
    } else {
      market.noSharesBalance[msg.sender] += net;
      market.totalNoShares += net;
    }

    emit SharesPurchased(marketId, msg.sender, isYes, net, fee);
  }

  function resolveMarket(
    uint256 marketId
  ) external validMarket(marketId) returns (bytes32 requestId) {
    Market storage market = markets[marketId];

    if (block.timestamp < market.endTs) revert MarketHaveNotEnded();
    if (market.resolved) revert MarketAlreadyResolved();

    FunctionsRequest.Request memory req;
    req.initializeRequestForInlineJavaScript(source);

    string[] memory args = new string[](1);
    args[0] = Strings.toHexString(market.token);
    req.setArgs(args);

    requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);

    Request storage request = requests[requestId];
    request.marketId = marketId;
    request.exists = true;

    s_lastRequestId = requestId;
    market.requestId = requestId;

    return requestId;
  }

  function fulfillRequest(
    bytes32 requestId,
    bytes memory response,
    bytes memory err
  ) internal override {
    Request storage request = requests[requestId];
    if (!request.exists) revert InvalidRequestId();

    request.fulfilled = true;
    request.response = response;
    request.error = err;

    s_lastResponse = response;
    s_lastError = err;

    Market storage market = markets[request.marketId];
    if (response.length > 0) {
      market.resolved = true;
      uint256 price = _decodePrice(response);
      if (market.targetIsAboveTargetPrice) {
        market.outcome = price > market.targetPrice ? MarketOutcome.YES : MarketOutcome.NO;
      } else {
        market.outcome = price < market.targetPrice ? MarketOutcome.YES : MarketOutcome.NO;
      }
    }

    emit MarketResolved(request.marketId, market.outcome);
  }

  function claim(uint256 marketId) external validMarket(marketId) nonReentrant {
    Market storage market = markets[marketId];
    if (!market.resolved || market.outcome == MarketOutcome.UNRESOLVED) revert MarketNotResolved();
    if (market.hasClaimed[msg.sender]) revert AlreadyClaimed();

    uint256 usrShares;
    uint256 winningShares;
    uint256 losingShares;

    if (market.outcome == MarketOutcome.YES) {
      usrShares = market.yesSharesBalance[msg.sender];
      winningShares = market.totalYesShares;
      losingShares = market.totalNoShares;
      market.yesSharesBalance[msg.sender] = 0;
    } else {
      usrShares = market.noSharesBalance[msg.sender];
      winningShares = market.totalNoShares;
      losingShares = market.totalYesShares;
      market.noSharesBalance[msg.sender] = 0;
    }

    if (usrShares <= 0) revert NoWinnings();
    market.hasClaimed[msg.sender] = true;

    uint256 rewardRatio = (losingShares * 1e18) / winningShares;
    uint256 winnings = usrShares + (usrShares * rewardRatio) / 1e18;

    market.bettingToken.safeTransfer(msg.sender, winnings);
    emit Claimed(marketId, msg.sender, winnings);
  }

  function getFee(uint256 amount) external view returns (uint256) {
    return _fee(amount);
  }

  function getAmountClaimable(
    uint256 marketId,
    address usr
  ) external view validMarket(marketId) returns (uint256) {
    Market storage market = markets[marketId];
    if (!market.resolved || market.outcome == MarketOutcome.UNRESOLVED || market.hasClaimed[usr]) {
      return 0;
    }

    uint256 usrShares;
    uint256 winningShares;
    uint256 losingShares;

    if (market.outcome == MarketOutcome.YES) {
      usrShares = market.yesSharesBalance[usr];
      winningShares = market.totalYesShares;
      losingShares = market.totalNoShares;
    } else {
      usrShares = market.noSharesBalance[usr];
      winningShares = market.totalNoShares;
      losingShares = market.totalYesShares;
    }

    if (usrShares <= 0) return 0;

    uint256 rewardRatio = (losingShares * 1e18) / winningShares;
    return usrShares + (usrShares * rewardRatio) / 1e18;
  }

  function getMarket(
    uint256 marketId
  )
    external
    view
    validMarket(marketId)
    returns (
      address token,
      address creator,
      address bettingToken,
      uint256 targetPrice,
      bool targetIsAboveTargetPrice,
      MarketOutcome outcome,
      uint256 endTs,
      bytes32 requestId,
      uint256 totalYesShares,
      uint256 totalNoShares,
      bool resolved
    )
  {
    Market storage market = markets[marketId];
    return (
      market.token,
      market.creator,
      address(market.bettingToken),
      market.targetPrice,
      market.targetIsAboveTargetPrice,
      market.outcome,
      market.endTs,
      market.requestId,
      market.totalYesShares,
      market.totalNoShares,
      market.resolved
    );
  }

  function getSharesBalance(
    uint256 marketId,
    address usr
  )
    external
    view
    validMarket(marketId)
    returns (uint256 yesShares, uint256 noShares, bool hasClaimed)
  {
    Market storage market = markets[marketId];
    return (market.yesSharesBalance[usr], market.noSharesBalance[usr], market.hasClaimed[usr]);
  }

  function setFeeBps(uint16 _feeBps) external onlyOwner {
    require(_feeBps <= 1000, 'Fee too high'); // -- max 10%
    feeBps = _feeBps;
  }

  function setFeeAddress(address _feeAddress) external onlyOwner {
    if (_feeAddress == address(0)) revert InvalidAddress();
    feeAddress = _feeAddress;
  }
}
