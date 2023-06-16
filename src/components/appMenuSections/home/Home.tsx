import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import colors from '../../../consts/colorPallete';
import './styles.css';

const Home = () => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div
      className="home-page-main-container"
      style={{
        backgroundColor: colors[appCurrentTheme].accent2,
        color: colors[appCurrentTheme].colorWriting,
        textAlign: 'center',
      }}
    >
      <div style={{ color: colors[appCurrentTheme].colorWriting }} className="page-heading-title">
        <h2>Decentralized Mining Pool</h2>
        <h2>Home</h2>
      </div>
      <div style={{ marginTop: 0 }}>
        <div>
          <b>In order to connect to the pool with your main Stacks account, follow these steps:</b>
        </div>
        <div style={{ marginTop: 40 }}>
          <div style={{ marginTop: -30, textAlign: 'match-parent' }}>
            - Click the 3 dots in the upper right corner on the Hiro Extension.<br></br>
            <div style={{ marginTop: 10 }}></div>- Click 'Change Network', then select 'Testnet'.<br></br>
            <div style={{ marginTop: 10 }}></div> - You can now log in onto the mining pool website, with the testnet
            address associated with your main account.
          </div>
        </div>
        <div style={{ marginTop: 40 }}>
          <b>In order to connect to the pool with a pre-made account, follow these steps:</b>
        </div>
        <div style={{ marginTop: 40 }}>
          <div style={{ marginTop: -30, textAlign: 'match-parent' }}>
            - Open your browser. You can either do this on a new browser profile, or on your main one.<br></br>
            <div style={{ marginTop: 10 }}></div>- Navigate to{' '}
            <a
              className="homePageLink"
              href="https://wallet.hiro.so/wallet/install-web"
              target="_blank"
              style={{ color: colors[appCurrentTheme].defaultOrange }}
            >
              https://wallet.hiro.so/wallet/install-web
            </a>
            . Follow the steps there, to install the Hiro Extension on your browser.<br></br>
            <div style={{ marginTop: 10 }}></div>- Open the Hiro Extension. You will be prompted for an option, click
            'Sign in with Secret Key'.<br></br>
            <div style={{ marginTop: 10 }}></div>- Copy the secret key (mnemonic) that corresponds to the account
            address you want to sign in with, from{' '}
            <a
              className="homePageLink"
              href="https://github.com/stacks-degens/starters-front-end/tree/profile-pages-design#accounts-in-mining-pool"
              target="_blank"
              style={{ color: colors[appCurrentTheme].defaultOrange }}
            >
              here
            </a>
            .<br></br>
            <div style={{ marginTop: 10 }}></div>- Paste the secret key into the field in the Hiro Extension.<br></br>
            <div style={{ marginTop: 10 }}></div>- Set up a password for the account. This will apply to you only, and
            you will need it in order to connect later.
            <br></br>
            <div style={{ marginTop: 10 }}></div>- Once you are connected to the account, click the 3 dots in the upper
            right corner on the Hiro Extension.<br></br>
            <div style={{ marginTop: 10 }}></div>- Click 'Change Network', then select 'Testnet'.<br></br>
            <div style={{ marginTop: 10 }}></div>- You can now log in onto the mining pool website, with the account you
            previously set up.
          </div>
        </div>
        <div style={{ marginTop: 40 }}>
          <b>In order to top-up your account:</b>
        </div>
        <div style={{ marginTop: 25 }}>Option 1:</div>
        <div style={{ marginTop: 40 }}>
          <div style={{ marginTop: -30, textAlign: 'match-parent' }}>
            - Navigate to{' '}
            <a
              className="homePageLink"
              href="https://explorer.hiro.so/?chain=testnet"
              target="_blank"
              style={{ color: colors[appCurrentTheme].defaultOrange }}
            >
              https://explorer.hiro.so/?chain=testnet
            </a>
            . Make sure you are on testnet.<br></br>
            If not, go to 'Network' button (in the header bar), and switch to testnet.<br></br>
            <div style={{ marginTop: 10 }}></div>- To the left of the 'Network' button in the header bar, click the
            'Sandbox' button.
            <br></br>
            <div style={{ marginTop: 10 }}></div>- Click the 'Connect Stacks Wallet' button in order to connect to your
            wallet. If you do not have a wallet, <br></br>follow the previous guide on how to create or connect to a
            pre-made one.<br></br>
            <div style={{ marginTop: 10 }}></div>- Once connected, click the button on the left menu that looks like a
            drop.<br></br>If you hover over it, the text should be 'Testnet Faucet'.<br></br>
            <div style={{ marginTop: 10 }}></div>- There, you can click on 'Request STX' in order to receive STX for
            testing purposes.<br></br>Please note that the transfer requires a few minutes for you to get the STX.
          </div>
        </div>
        <div style={{ marginTop: 25 }}>Option 2:</div>
        <div style={{ marginTop: 40 }}>
          <div style={{ marginTop: -30, textAlign: 'match-parent' }}>
            - You need to have 'npm' command installed to your local machine's terminal.<br></br>
            <div style={{ marginTop: 10 }}></div>- Run 'npm install -g @stacks/cli' command in order to install the
            'stx' command to your terminal.<br></br>For more info, visit{' '}
            <a
              className="homePageLink"
              href="https://docs.hiro.so/get-started/command-line-interface"
              target="_blank"
              style={{ color: colors[appCurrentTheme].defaultOrange }}
            >
              https://docs.hiro.so/get-started/command-line-interface
            </a>
            .<br></br>
            <div style={{ marginTop: 10 }}></div>- Run 'stx faucet address' command in terminal (e.g.<br></br>'stx
            faucet ST02D2KP0630FS1BCJ7YM4TYMDH6NS9QKR0B57R3'),<br></br>and you will receive STX in the account
            associated with the address.
            <br></br>Please note that the transfer requires a few minutes for you to get the STX.
          </div>
        </div>
      </div>
      <div style={{ marginTop: 30 }}>
        <br></br>
      </div>
    </div>
  );
};

export default Home;
