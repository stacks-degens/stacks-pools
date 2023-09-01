import './styles.css';
import RoleIntroStacking from './RoleIntroStacking';
import AboutContainerStacking from './AboutContainerStacking';
import ActionsContainerStacking from './ActionsContainerStacking';

interface IStackerProfileProps {
  currentRole: string;
  connectedWallet: string | null;
  explorerLink: string | undefined;
  userAddress: string | null;
  lockedInPool: number | null;
  delegatedToPool: number | null;
  userUntilBurnHt: number | null;
}

const StackerProfile = ({
  currentRole,
  connectedWallet,
  explorerLink,
  userAddress,
  lockedInPool,
  delegatedToPool,
  userUntilBurnHt,
}: IStackerProfileProps) => {
  return (
    <div>
      <div className="principal-content-profile-page">
        <RoleIntroStacking currentRole={currentRole} />
        <div
          className={
            currentRole === 'Provider' || currentRole === 'Stacker'
              ? 'main-info-container-stacking'
              : 'main-info-container-stacking-normal-user'
          }
        >
          <AboutContainerStacking
            currentRole={currentRole}
            connectedWallet={connectedWallet}
            lockedInPool={lockedInPool}
            explorerLink={explorerLink}
            delegatedToPool={delegatedToPool}
            userUntilBurnHt={userUntilBurnHt}
          />
          {(currentRole === 'Provider' || currentRole === 'Stacker') && (
            <ActionsContainerStacking
              userAddress={userAddress}
              currentRole={currentRole}
              delegatedToPool={delegatedToPool}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StackerProfile;
