import { useCallback, useEffect, useState } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';

type DisplayEncoding = 'utf8' | 'hex';
type PhantomEvent = 'disconnect' | 'connect' | 'accountChanged';
type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage';

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

export const getProvider = (): PhantomProvider | undefined => {
  if ('solana' in window) {
    const anyWindow: any = window;
    const provider = anyWindow.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open('https://phantom.app/', '_blank');
  return undefined;
};

export const checkIfWalletIsConnected = async () => {
  try {
    const provider = getProvider();
    if (provider) {
      console.log('Wallet found! Phantom');
      const { publicKey } = await provider.connect({ onlyIfTrusted: true });
      return { provider, walletAddress: publicKey.toString() };
    } else {
      alert('Solana object not found! Get a Phantom Wallet 👻');
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const usePhantomWallet = () => {
  const [wallet, setWallet] = useState<PhantomProvider | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  useEffect(() => {
    const onLoad = async () => {
      const walletInfo = await checkIfWalletIsConnected();
      if (!walletInfo) {
        return;
      }
      setWallet(walletInfo.provider);
      setWalletAddress(walletInfo.walletAddress);
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  const connect = useCallback(async () => {
    console.log('Connecting...');
    if (!wallet) {
      return;
    }
    const { publicKey } = await wallet.connect();
    setWalletAddress(publicKey.toString());
  }, [wallet]);
  useEffect(() => {
    console.log('Wallet address', walletAddress);
  }, [walletAddress]);
  return { wallet, walletAddress, connect };
};
