import { useCallback, useEffect, useState } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import { AnchorProvider, Idl, Program, web3 } from '@project-serum/anchor';
import idl from '@backend/target/idl/backend.json';
import kp from '@client/src/keypair.json';

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

const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: 'processed',
} as const;

export const getAnchorProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  if ('solana' in window) {
    const anyWindow: any = window;
    const provider = new AnchorProvider(connection, anyWindow.solana, opts);
    return provider;
  }
  return null;
};

export const getGifList = async () => {
  try {
    const provider = getAnchorProvider();
    if (!provider) {
      return null;
    }
    const program = new Program(idl as Idl, programID, provider);
    const account = await program.account['baseAccount'].fetch(
      baseAccount.publicKey
    );

    console.log('Got the account', account);
    return account['gifList'];
  } catch (error) {
    console.log('Error in getGifList: ', error);
    return null;
  }
};

export const createGifAccount = async () => {
  try {
    const provider = getAnchorProvider();
    if (!provider) {
      return;
    }
    const program = new Program(idl as Idl, programID, provider);
    console.log('ping');
    await program.rpc['startStuffOff']({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    console.log(
      'Created a new BaseAccount w/ address:',
      baseAccount.publicKey.toString()
    );
    await getGifList();
  } catch (error) {
    console.log('Error creating BaseAccount account:', error);
  }
};

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

export const sendGiff = async (link: string) => {
  console.log('Gif link:', link);
  try {
    const provider = getAnchorProvider();
    if (!provider) {
      throw Error('No provider');
    }
    const program = new Program(idl as Idl, programID, provider);

    await program.rpc['addGif'](link, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });
    console.log('GIF successfully sent to program', link);

    await getGifList();
  } catch (error) {
    console.log('Error sending GIF:', error);
  }
};

export const usePhantomWallet = () => {
  const [wallet, setWallet] = useState<PhantomProvider | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  useEffect(() => {
    const onLoad = async () => {
      const walletInfo = await checkIfWalletIsConnected();
      if (!walletInfo) {
        console.log('No wallet found connected');
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
      console.log('No Wallet, abort connecting');
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
