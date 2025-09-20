'use client';

import { LIFI_INTEGRATOR } from '@/lib/constants';
import { getLifiWidgetConfig } from '@/lib/helpers';
import { LiFiWidget, type WidgetConfig, type FormState, WidgetSkeleton } from '@lifi/widget';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import React from 'react';
import { Wallet2 } from 'lucide-react';
import ConnectButton from '@/components/global/ConnectButton';

type Props = {
  coin: Coin;
  bgColor?: string;
  isBuy?: boolean;
};

export default function SwapWidget({ coin, bgColor, isBuy = true }: Props) {
  const ETH = '0x0000000000000000000000000000000000000000';
  const account = useAccount();
  const formRef = React.useRef<FormState>(null);
  const { authenticated, user } = usePrivy();

  const widgetConfig: WidgetConfig = React.useMemo(
    () => getLifiWidgetConfig({ address: account.address, bgColor, userId: user?.id }),
    [account.address, bgColor, user]
  );

  React.useEffect(() => {
    if (isBuy) {
      formRef.current?.setFieldValue('toToken', coin.address);
      formRef.current?.setFieldValue('fromToken', ETH);
    } else {
      formRef.current?.setFieldValue('fromToken', coin.address);
      formRef.current?.setFieldValue('toToken', ETH);
    }
  }, [coin, isBuy]);

  if (!authenticated) {
    return (
      <div className="py-25 flex flex-col items-center justify-center text-center">
        <Wallet2 size={35} strokeWidth={1.5} className="opacity-60 mb-2" />
        <h4 className="font-bold text-xl mb-0.5">Connect your wallet</h4>
        <p className="text-muted-foreground mb-4">Connect your wallet to swap token</p>
        <ConnectButton />
      </div>
    );
  }

  if (!account.address) {
    return <WidgetSkeleton config={widgetConfig} />;
  }

  return <LiFiWidget integrator={LIFI_INTEGRATOR} config={widgetConfig} formRef={formRef} />;
}
