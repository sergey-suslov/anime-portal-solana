// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './app.css';
import twitterLogo from '../assets/twitter-logo.svg';
import { usePhantomWallet } from '@client/src/service/wallet';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const wallet = usePhantomWallet();

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          <p className="sub-text">
            Wallet satatus is {wallet ? `connected ✨`: 'not connected'}
          </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
