import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import colors from '../../../consts/colorPallete';
import './styles.css';
import { network } from '../../../consts/network';

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
      <div
        style={{ color: colors[appCurrentTheme].colorWriting }}
        className="page-heading-title"
      >
        <h2>Stacks Decentralized Pools</h2>
        <h2>Home</h2>
      </div>

      <div style={{ marginTop: 0 }}>
        <b>Install Hiro/Leather wallet:</b>
      </div>
      <div style={{ marginTop: 40 }}>
        <div style={{ marginTop: -30, textAlign: 'match-parent' }}>
          <div style={{ marginTop: 10 }}></div>- To install the Hiro Extension
          on your browser navigate to{' '}
          <a
            className="homePageLink"
            href="https://wallet.hiro.so/wallet/install-web"
            target="_blank"
            style={{ color: colors[appCurrentTheme].defaultOrange }}
          >
            https://wallet.hiro.so/wallet/install-web
          </a>{' '}
          and follow the steps there.<br></br>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <div>
          <b>
            Connect to the pool using your Stacks account following these steps:
          </b>
        </div>
        <div style={{ marginTop: 40 }}>
          <div style={{ marginTop: -30, textAlign: 'match-parent' }}></div>-
          Open Hiro/Leather Wallet extension.
          <br></br>
          <div style={{ marginTop: 10 }}>
            - Click the 3 dots in the upper right corner on the Hiro
            Wallet/Leather Extension.<br></br>
            <div style={{ marginTop: 10 }}></div>- Click 'Change Network', then
            select '{network}'.<br></br>
            <div style={{ marginTop: 10 }}></div> - Click the top right corner
            button of the Stacking Pool app in order to connect your wallet.
          </div>
        </div>
        {network !== 'mainnet' && (
          <>
            <div style={{ marginTop: 40 }}>
              <b>Fund your account with testnet STX:</b>
            </div>
            <div style={{ marginTop: 40 }}>
              <div style={{ marginTop: -30, textAlign: 'match-parent' }}>
                - In order to fund your account, navigate to{' '}
                <a
                  className="homePageLink"
                  href="https://explorer.hiro.so/sandbox/faucet?chain=testnet"
                  target="_blank"
                  style={{ color: colors[appCurrentTheme].defaultOrange }}
                >
                  https://explorer.hiro.so/sandbox/faucet?chain=testnet
                </a>
                .<br></br>
                <div style={{ marginTop: 10 }}></div>- Click the 'Connect Stacks
                Wallet' button in order to connect to your wallet. If you do not
                have a wallet, <br></br>follow the previous guide on how to
                create one.<br></br>
                <div style={{ marginTop: 10 }}></div>- There, you can click on
                'Request STX' in order to receive STX for testing purposes.
                <br></br>Please note that the transfer requires a few minutes
                for you to get the STX.
              </div>
            </div>

            <div style={{ marginTop: 40 }}>
              <b>Extra: liquidity-provider testing</b>
            </div>
            <div style={{ marginTop: 40 }}>
              <div style={{ marginTop: -30, textAlign: 'match-parent' }}>
                - If you want to fit into the Liquidity Provider scenario
                navigate to{' '}
                <a
                  className="homePageLink"
                  href="https://github.com/stacks-degens/starters-front-end#readme"
                  target="_blank"
                  style={{ color: colors[appCurrentTheme].defaultOrange }}
                >
                  this link
                </a>
                . <br></br>
                <div style={{ marginTop: 10 }}></div>- From the accounts list
                choose the `Deployer` one and copy its `mnemonic`. <br></br>
                <div style={{ marginTop: 10 }}></div>- Open your Hiro/Leather
                wallet and connect to the `Liquidity Provider` account,{' '}
                <br></br> select `Use existing key` option and write the
                mnemonic copied before
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <br></br>
      </div>
    </div>
  );
};

export default Home;
