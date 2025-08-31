'use client';

import { useStorage } from '@/hooks/useStorage';
import { Zap, RotateCw, X, Check, Pencil, ShoppingCart, Percent, Settings } from 'lucide-react';
import React from 'react';
import Ethereum from '../icons/Ethereum';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import useModal from '@/hooks/useModal';

const QuickBuySetting = () => {
  const storage = useStorage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(storage.quickBuyPreset);

  return (
    <div>
      <div className="border-b px-3.5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2">
            <Zap className="size-3.5 opacity-60" />
            <p className="font-medium text-[13px]">Quick Buy Preset</p>
          </div>

          {isOpen ? (
            <Button
              size={'sm'}
              variant={'link'}
              className="text-yellow-500"
              onClick={() => {
                setValue(storage.quickBuyPreset);
                setIsOpen(false);
              }}
            >
              <RotateCw className="size-3" strokeWidth={2.5} />
              <p className="text-[13px]">Reset</p>
            </Button>
          ) : null}
        </div>

        <div className="flex items-center">
          {isOpen ? (
            <React.Fragment>
              <Button
                size={'sm'}
                variant={'link'}
                onClick={() => setIsOpen(false)}
                className="text-[#999]"
              >
                <X className="size-4 sm:size-3" strokeWidth={2.5} />
                <p className="text-[13px] hidden sm:block">Discard</p>
              </Button>

              <Button
                size={'sm'}
                variant={'link'}
                onClick={() => {
                  storage.setQuickBuyPreset(value);
                  setIsOpen(false);
                }}
                className="text-green-400"
              >
                <Check className="size-4 sm:size-3" strokeWidth={2.5} />
                <p className="text-[13px] hidden sm:block">Save Changes</p>
              </Button>
            </React.Fragment>
          ) : (
            <Button
              size={'sm'}
              variant={'link'}
              onClick={() => setIsOpen(true)}
              className="text-green-400"
            >
              <Pencil className="size-3" strokeWidth={2.5} />
              <p className="text-[13px]">Edit</p>
            </Button>
          )}
        </div>
      </div>

      {isOpen ? (
        <div className="px-3.5 py-3 flex justify-end">
          <div className="relative bg-background rounded-lg">
            <Input
              className="w-[7.5rem] pl-3.5 font-medium h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              type="number"
              autoComplete="off"
              style={{ fontSize: '12px' }}
              value={String(value)}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !isNaN(Number(value))) setValue(Number(value));
              }}
            />
            <Ethereum className="absolute size-3 right-[7px] top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const BuyPresets = () => {
  const storage = useStorage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(storage.buyPresets);

  return (
    <div>
      <div className="border-b px-3.5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-3.5 opacity-60" />
            <p className="font-medium text-[13px]">Buy Preset Buttons</p>
          </div>

          {isOpen ? (
            <Button
              size={'sm'}
              variant={'link'}
              className="text-yellow-500"
              onClick={() => {
                setValue(storage.buyPresets);
                setIsOpen(false);
              }}
            >
              <RotateCw className="size-3" strokeWidth={2.5} />
              <p className="text-[13px]">Reset</p>
            </Button>
          ) : null}
        </div>

        <div className="flex items-center">
          {isOpen ? (
            <React.Fragment>
              <Button
                size={'sm'}
                variant={'link'}
                onClick={() => setIsOpen(false)}
                className="text-[#999]"
              >
                <X className="size-4 sm:size-3" strokeWidth={2.5} />
                <p className="text-[13px] hidden sm:block">Discard</p>
              </Button>

              <Button
                size={'sm'}
                variant={'link'}
                onClick={() => {
                  storage.setBuyPresets(value);
                  setIsOpen(false);
                }}
                className="text-green-400"
              >
                <Check className="size-4 sm:size-3" strokeWidth={2.5} />
                <p className="text-[13px] hidden sm:block">Save Changes</p>
              </Button>
            </React.Fragment>
          ) : (
            <Button
              size={'sm'}
              variant={'link'}
              onClick={() => setIsOpen(true)}
              className="text-green-400"
            >
              <Pencil className="size-3" strokeWidth={2.5} />
              <p className="text-[13px]">Edit</p>
            </Button>
          )}
        </div>
      </div>

      {isOpen ? (
        <div className="flex justify-end">
          <div className="px-3.5 py-3 flex justify-end w-full md:w-[28rem]">
            <div className="flex items-center gap-3">
              {value.map((entry, idx) => (
                <div key={entry} className="flex-1 relative bg-background rounded-lg">
                  <Input
                    className="w-full font-medium h-8 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    type="number"
                    autoComplete="off"
                    style={{ fontSize: '12px' }}
                    value={String(entry)}
                    onChange={(e) => {
                      const inp = e.target.value;
                      if (!isNaN(Number(inp))) {
                        const arr = [...value];
                        arr[idx] = Number(inp);
                        // --
                        setValue(arr);
                      }
                    }}
                  />
                  <Ethereum className="absolute size-3 right-[7px] top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const SellPresets = () => {
  const storage = useStorage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(storage.sellPresets);

  return (
    <div>
      <div className="border-b px-3.5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2">
            <Percent className="size-3.5 opacity-60" />
            <p className="font-medium text-[13px]">Sell Preset Buttons</p>
          </div>

          {isOpen ? (
            <Button
              size={'sm'}
              variant={'link'}
              className="text-yellow-500"
              onClick={() => {
                setValue(storage.sellPresets);
                setIsOpen(false);
              }}
            >
              <RotateCw className="size-3" strokeWidth={2.5} />
              <p className="text-[13px]">Reset</p>
            </Button>
          ) : null}
        </div>

        <div className="flex items-center">
          {isOpen ? (
            <React.Fragment>
              <Button
                size={'sm'}
                variant={'link'}
                onClick={() => setIsOpen(false)}
                className="text-[#999]"
              >
                <X className="size-4 sm:size-3" strokeWidth={2.5} />
                <p className="hidden sm:block text-[13px]">Discard</p>
              </Button>

              <Button
                size={'sm'}
                variant={'link'}
                onClick={() => {
                  storage.setSellPresets(value);
                  setIsOpen(false);
                }}
                className="text-green-400"
              >
                <Check className="size-4 sm:size-3" strokeWidth={2.5} />
                <p className="hidden sm:block text-[13px]">Save Changes</p>
              </Button>
            </React.Fragment>
          ) : (
            <Button
              size={'sm'}
              variant={'link'}
              onClick={() => setIsOpen(true)}
              className="text-green-400"
            >
              <Pencil className="size-3" strokeWidth={2.5} />
              <p className="text-[13px]">Edit</p>
            </Button>
          )}
        </div>
      </div>

      {isOpen ? (
        <div className="flex justify-end">
          <div className="px-3.5 py-3 flex justify-end w-full md:w-[28rem]">
            <div className="flex items-center gap-3">
              {value.map((entry, idx) => (
                <div key={entry} className="flex-1 relative bg-background rounded-lg">
                  <Input
                    className="w-full font-medium h-8 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    type="number"
                    autoComplete="off"
                    style={{ fontSize: '12px' }}
                    value={String(entry)}
                    onChange={(e) => {
                      const inp = e.target.value;
                      if (!isNaN(Number(inp))) {
                        const arr = [...value];
                        arr[idx] = Number(inp);
                        // --
                        setValue(arr);
                      }
                    }}
                  />
                  <Percent className="absolute size-3 right-[7px] top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default function SettingsModal() {
  const { close } = useModal();

  return (
    <div className="h-[30rem]">
      <div className="flex items-center justify-between p-3.5 border-b">
        <div className="flex items-center gap-2">
          <Settings className="opacity-60 size-4" strokeWidth={2} />
          <span className="font-medium text-sm text-green-500">Settings</span>
        </div>

        <button onClick={close}>
          <X className="size-4 opacity-60" />
        </button>
      </div>

      <div className="-space-y-1 -mt-1">
        <QuickBuySetting />
        <BuyPresets />
        <SellPresets />
      </div>
    </div>
  );
}
