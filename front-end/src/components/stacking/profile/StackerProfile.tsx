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
  stacksAmountThisCycle: number | null;
  reservedAmount: number | null;
  returnCovered: number | null;
  userUntilBurnHt: number | null;
  currentBurnBlockHeight: number | null;
  currentCycle: number | null;
  preparePhaseStartBlockHeight: number | null;
  rewardPhaseStartBlockHeight: number | null;
}

const StackerProfile = ({
  currentRole,
  connectedWallet,
  explorerLink,
  userAddress,
  lockedInPool,
  delegatedToPool,
  stacksAmountThisCycle,
  reservedAmount,
  returnCovered,
  userUntilBurnHt,
  currentBurnBlockHeight,
  currentCycle,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
}: IStackerProfileProps) => {
  if (
    currentBurnBlockHeight !== null &&
    currentCycle !== null &&
    preparePhaseStartBlockHeight !== null &&
    rewardPhaseStartBlockHeight !== null &&
    reservedAmount !== null &&
    returnCovered !== null &&
    stacksAmountThisCycle !== null
  )
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
              reservedAmount={reservedAmount}
              stacksAmountThisCycle={stacksAmountThisCycle}
              returnCovered={returnCovered}
              userUntilBurnHt={userUntilBurnHt}
              currentBurnBlockHeight={currentBurnBlockHeight}
              currentCycle={currentCycle}
              preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
              rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
            />
            {(currentRole === 'Provider' || currentRole === 'Stacker') && (
              <ActionsContainerStacking
                userAddress={userAddress}
                currentRole={currentRole}
                stacksAmountThisCycle={stacksAmountThisCycle}
                delegatedToPool={delegatedToPool}
                reservedAmount={reservedAmount}
                returnCovered={returnCovered}
                currentBurnBlockHeight={currentBurnBlockHeight}
                currentCycle={currentCycle}
                preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
                rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
              />
            )}
          </div>
        </div>
      </div>
    );
};

export default StackerProfile;
