import { useEffect, useState } from 'react';
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

export const checkIfWalletIsConnected = () => {
  try {
    const provider = getProvider();
    if (provider) {
      console.log('Wallet found! Phantom');
      return provider;
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
  useEffect(() => {
    const onLoad = async () => {
      const provider = checkIfWalletIsConnected();
      setWallet(provider);
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return wallet
};
