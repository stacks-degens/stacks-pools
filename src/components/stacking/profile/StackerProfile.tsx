import './styles.css';
import RoleIntroStacking from './RoleIntroStacking';
import AboutContainerStacking from './AboutContainerStacking';
import ActionsContainerStacking from './ActionsContainerStacking';

interface IStackerProfileProps {
  currentRole: string;
  connectedWallet: string | null;
  explorerLink: string | undefined;
  userAddress: string | null;
}

const StackerProfile = ({ currentRole, connectedWallet, explorerLink, userAddress }: IStackerProfileProps) => {
  return (
    <div>
      <div className="principal-content-profile-page">
        <RoleIntroStacking currentRole={currentRole} />
        <div
          className={
            currentRole === 'Provider' ? 'main-info-container-stacking' : 'main-info-container-stacking-normal-user'
          }
        >
          <AboutContainerStacking
            currentRole={currentRole}
            connectedWallet={connectedWallet}
            explorerLink={explorerLink}
          />
          {currentRole === 'Provider' && (
            <ActionsContainerStacking userAddress={userAddress} currentRole={currentRole} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StackerProfile;
