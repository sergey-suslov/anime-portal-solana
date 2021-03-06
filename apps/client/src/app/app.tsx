// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './app.css';
import twitterLogo from '../assets/twitter-logo.svg';
import {
  createGifAccount as createSolanaGifAccount,
  usePhantomWallet,
} from '@client/src/service/wallet';
import { useCallback, useState } from 'react';
import { useGifs } from '@client/src/service/gifs';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const { walletAddress, connect } = usePhantomWallet();

  const { gifList, addGiff, fetchGifs, like } = useGifs();

  const [inputValue, setInputValue] = useState('');
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
  };
  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
      await addGiff(inputValue);
      setInputValue('');
    } else {
      console.log('Empty input. Try again.');
    }
  };
  const createGifAccount = useCallback(async () => {
    await createSolanaGifAccount();
    fetchGifs();
  }, [fetchGifs]);

  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connect}>
      Connect to Wallet
    </button>
  );
  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    }

    console.log('GFS', gifList)
    return (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
          {gifList &&
            gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} />
                <p className="gif-user">{item.userAddress.toString()}</p>
                <button className="button" onClick={() => like(item.id)}>{item.likes && item.likes}????</button>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">
            ???? <span className="gradient-text-dark">GIF Portal</span>
          </p>
          <p className="sub-text">
            View your GIF collection in the metaverse ???
          </p>
          <p className="sub-text">
            Wallet satatus is{' '}
            {walletAddress ? (
              <span className="gradient-text">connected ???</span>
            ) : (
              'not connected'
            )}
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <div className="footer-container-content">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
