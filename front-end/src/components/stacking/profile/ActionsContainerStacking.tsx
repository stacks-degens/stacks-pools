import './styles.css';
import colors from '../../../consts/colorPallete';
import { useEffect, useState } from 'react';
import {
  ContractDelegateSTXStacking,
  ContractDisallowContractCallerStacking,
  ContractLeavePoolStacking,
  ContractRevokeDelegateStacking,
  ContractRewardDistributionStacking,
  ContractStackManySTX,
  ContractUpdateScBalancesStacking,
} from '../../../consts/smartContractFunctions';
import {
  readOnlyAlreadyRewardedBurnBlock,
  readOnlyClaimedBlockStatusStacking,
  readOnlyGetLiquidityProvider,
  readOnlyHasWonBurnBlock,
} from '../../../consts/readOnly';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme } from '../../../redux/reducers/user-state';
import { Alert, Checkbox } from '@mui/material';
import { ElectricBolt } from '@mui/icons-material';
import ActionsContainerProviderStacking from './ActionsContainerProviderStacking';
import MouseOverPopover from './MouseOverPopover';
import { network } from '../../../consts/network';

interface IActionsContainerStackingProps {
  userAddress: string | null;
  currentRole: string;
  delegatedToPool: number | null;
  stacksAmountThisCycle: number;
  reservedAmount: number;
  returnCovered: number;
  currentBurnBlockHeight: number;
  currentCycle: number;
  preparePhaseStartBlockHeight: number;
  rewardPhaseStartBlockHeight: number;
}

const ActionsContainerStacking = ({
  userAddress,
  currentRole,
  delegatedToPool,
  stacksAmountThisCycle,
  reservedAmount,
  returnCovered,
  currentBurnBlockHeight,
  currentCycle,
  preparePhaseStartBlockHeight,
  rewardPhaseStartBlockHeight,
}: IActionsContainerStackingProps) => {
  const [showAlertLeavePool, setShowAlertLeavePool] = useState<boolean>(false);
  const [leavePoolButtonClicked, setLeavePoolButtonClicked] = useState<boolean>(false);
  const [disableLeavePoolButton, setDisableLeavePoolButton] = useState<boolean>(false);

  const [claimRewardsButtonClicked, setClaimRewardsButtonClicked] = useState<boolean>(false);
  const [canCallClaim, setCanCallClaim] = useState<boolean>(true);
  const [showAlertClaimReward, setShowAlertClaimReward] = useState<boolean>(false);

  const [delegateButtonClicked, setDelegateButtonClicked] = useState<boolean>(false);
  // const [canCallClaim, setCanCallClaim] = useState<boolean>(true);
  const [delegateCheckboxClicked, setDelegateCheckboxClicked] = useState<boolean>(false);
  const [showAlertCanSafelyDelegate, setShowAlertCanSafelyDelegate] = useState<boolean>(false);
  // not canSafelyDelegate && checkbox not clicked -> disable button

  const [delegateAmountInput, setDelegateAmountInput] = useState<number | null>(null);
  const [increaseDelegateAmountInput, setIncreaseDelegateAmountInput] = useState<number | null>(null);

  const [claimRewardsInputAmount, setClaimRewardsInputAmount] = useState<number | null>(null);
  const [currentLiquidityProvider, setCurrentLiquidityProvider] = useState<string | null>(null);
  const [hasWonBurnBlock, setHasWonBurnBlock] = useState<boolean>(true);
  const [alreadyRewardedBurnBlock, setAlreadyRewardedBurnBlock] = useState<boolean>(true);

  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  const numberOfBlocksPreparePhase = rewardPhaseStartBlockHeight - preparePhaseStartBlockHeight;
  const numberOfBlocksRewardPhase = numberOfBlocksPreparePhase * 20;
  const numberOfBlocksPerCycle = numberOfBlocksPreparePhase + numberOfBlocksRewardPhase;

  const messageDelegate = `Remaining blocks to delegate for cycle ${currentCycle + 1}: ${
    preparePhaseStartBlockHeight - currentBurnBlockHeight - 1
  } blocks`;

  let messageUpdateBalances = '';
  let canCallUpdateBalances = false;
  if (currentBurnBlockHeight - preparePhaseStartBlockHeight + numberOfBlocksPerCycle < numberOfBlocksPreparePhase / 2) {
    const remaining = preparePhaseStartBlockHeight + numberOfBlocksPreparePhase / 2 - currentBurnBlockHeight;
    messageUpdateBalances = `Remaining blocks to update balances for cycle: ${currentCycle}: ${remaining} blocks`;
    canCallUpdateBalances = true;
  } else {
    const remaining = preparePhaseStartBlockHeight - currentBurnBlockHeight;
    messageUpdateBalances = `You can call start calling update-balances in ${remaining} blocks. It can be called for the next ${
      numberOfBlocksPreparePhase / 2
    } blocks after the starting period.`;
    canCallUpdateBalances = false;
  }

  let messageStackFundsMultipleUsers = '';
  let canCallStackFundsMultipleUsers = false;
  if (currentBurnBlockHeight - preparePhaseStartBlockHeight + numberOfBlocksPerCycle >= numberOfBlocksPerCycle / 2) {
    // possible now -> remaining time to call it: x blocks
    let remaining = preparePhaseStartBlockHeight - currentBurnBlockHeight - 1;
    messageStackFundsMultipleUsers = `Remaining blocks to stack for cycle: ${currentCycle + 1}: ${remaining} blocks`;
    canCallStackFundsMultipleUsers = true;
  } else {
    // not yet -> in x blocks available
    let remaining = preparePhaseStartBlockHeight - numberOfBlocksPerCycle / 2 - currentBurnBlockHeight;
    messageStackFundsMultipleUsers = `You can call start calling stack funds multiple in ${remaining} blocks. It can be called for the next ${
      numberOfBlocksPerCycle / 2
    } blocks.`;
    canCallStackFundsMultipleUsers = false;
  }

  const updateScBalances = async () => {
    ContractUpdateScBalancesStacking();
  };

  const delegateAmount = (amount: number) => {
    if (amount !== null && !isNaN(amount)) {
      if (amount < 0.000001) {
        alert('You need to input more');
      } else {
        if (userAddress !== null) {
          if (
            reservedAmount * returnCovered <
              stacksAmountThisCycle + (delegateAmountInput === null ? 0 : delegateAmountInput) &&
            !delegateCheckboxClicked
          ) {
            setShowAlertCanSafelyDelegate(true);
          } else ContractDelegateSTXStacking(amount, userAddress);
        }
      }
    }
  };

  const increaseDelegateAmount = (alreadyDelegated: number, amount: number) => {
    if (amount !== null && !isNaN(amount)) {
      if (amount < 0.000001) {
        alert('You need to input more');
      } else {
        if (userAddress !== null) {
          ContractDelegateSTXStacking(amount + alreadyDelegated, userAddress);
        }
      }
    }
  };

  const onClickStackFunds = () => {
    const inputListNode = document.getElementById('listId');
    const inputList = inputListNode?.value;
    console.log('inputList output: ', parseList(inputList));
    const parsedList = parseList(inputList);
    ContractStackManySTX(parsedList);
  };

  const parseList = (inputList: String) => {
    return inputList.replaceAll(' ', '').split(',');
  };

  useEffect(() => {
    const getCurrentLiquidityProvider = async () => {
      const liquidityProvider = await readOnlyGetLiquidityProvider();
      setCurrentLiquidityProvider(liquidityProvider);
    };

    getCurrentLiquidityProvider();
  }, [currentLiquidityProvider]);

  useEffect(() => {
    const getHasWonBurnBlock = async () => {
      if (claimRewardsInputAmount) {
        const hasWon = await readOnlyHasWonBurnBlock(claimRewardsInputAmount);
        setHasWonBurnBlock(hasWon);
      }
    };
    getHasWonBurnBlock();
  }, [claimRewardsInputAmount]);

  useEffect(() => {
    const getAlreadyRewardedBurnBlock = async () => {
      if (claimRewardsInputAmount) {
        const hasWon = await readOnlyAlreadyRewardedBurnBlock(claimRewardsInputAmount);
        setAlreadyRewardedBurnBlock(hasWon);
      }
    };
    getAlreadyRewardedBurnBlock();
  }, [claimRewardsInputAmount]);

  const leavePool = () => {
    setLeavePoolButtonClicked(true);
    if (currentLiquidityProvider !== null && currentLiquidityProvider !== userAddress) {
      ContractLeavePoolStacking();
    } else if (currentLiquidityProvider !== null && currentLiquidityProvider === userAddress) {
      setShowAlertLeavePool(true);
      setDisableLeavePoolButton(true);
    }
  };

  const claimRewards = async () => {
    setClaimRewardsButtonClicked(true);

    if (claimRewardsInputAmount !== null && !alreadyRewardedBurnBlock && hasWonBurnBlock) {
      ContractRewardDistributionStacking(claimRewardsInputAmount);
    } else {
      setShowAlertClaimReward(true);
    }
  };

  const revokeDelegate = () => {
    ContractRevokeDelegateStacking();
  };

  const disallowContractCaller = () => {
    if (userAddress !== null) ContractDisallowContractCallerStacking(userAddress);
  };

  useEffect(() => {
    if (leavePoolButtonClicked && showAlertLeavePool) setDisableLeavePoolButton(true);
  }, [leavePoolButtonClicked, showAlertLeavePool]);

  const toggleCheckboxValue = () => {
    setDelegateCheckboxClicked(!delegateCheckboxClicked);
  };

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-stacking-profile-page actions-container-profile-page"
    >
      <div
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
          borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
        }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[appCurrentTheme].defaultYellow }} className="heading-icon-info-container">
            <ElectricBolt className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-container bold-font">ACTIONS</div>
        </div>
      </div>

      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="content-info-container-stacking justify-content-between"
      >
        <div>
          {currentRole === 'Provider' && (
              <ActionsContainerProviderStacking
                userAddress={userAddress}
                currentBurnBlockHeight={currentBurnBlockHeight}
                currentCycle={currentCycle}
                preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
                rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
              />
            ) && (
              <div className="flex-container align-items-center input-line-actions-container-stacking">
                <div className="width-55 label-and-input-container-actions-container">
                  <label className="custom-label">Lock funds for the next cycle</label>
                  <div className="bottom-margins">
                    <input
                      className="custom-input"
                      type="text"
                      id="listId"
                      placeholder="principal, principal, principal etc."
                    ></input>
                  </div>
                </div>
                <div className="button-container-stacking-action-container-stacking">
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
                      <MouseOverPopover severityType="info" text={messageStackFundsMultipleUsers} />
                    </span>
                    <button
                      className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                      onClick={() => {
                        onClickStackFunds();
                      }}
                      disabled={!canCallStackFundsMultipleUsers}
                    >
                      Stack Funds Multiple Users
                    </button>
                  </div>
                </div>
              </div>
            )}

          {delegateAmountInput !== null &&
            reservedAmount * returnCovered < stacksAmountThisCycle + delegateAmountInput &&
            showAlertCanSafelyDelegate && (
              <div className="block-margins-auto alert-container-stacking-actions-container-stacking">
                <Alert
                  severity="warning"
                  onClose={() => {
                    setShowAlertCanSafelyDelegate(false);
                    setDelegateCheckboxClicked(false);
                  }}
                >
                  I acknowledge that the amount entered combined with the already stacked pool amount is more than the
                  stacked amount covered by the pool.
                  <Checkbox checked={delegateCheckboxClicked} onClick={() => toggleCheckboxValue()} />
                </Alert>
              </div>
            )}
          <div className="flex-container align-items-center input-line-actions-container-stacking">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert amount of STX to delegate</label>
              <div className="bottom-margins">
                <input
                  className="custom-input"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseFloat(inputAmount);
                    setDelegateAmountInput(inputAmountToInt);
                  }}
                ></input>
              </div>
            </div>
            <div className="button-container-stacking-action-container-stacking">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
                  <MouseOverPopover severityType="info" text={messageDelegate} />
                </span>
                <button
                  className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                  disabled={
                    !!delegatedToPool ||
                    (reservedAmount * returnCovered <
                      stacksAmountThisCycle + (delegateAmountInput === null ? 0 : delegateAmountInput) &&
                      showAlertCanSafelyDelegate &&
                      !delegateCheckboxClicked)
                  }
                  onClick={() => {
                    if (delegateAmountInput !== null) delegateAmount(delegateAmountInput);
                  }}
                >
                  Delegate
                </button>
              </div>
            </div>
          </div>
          <div className="flex-container align-items-center input-line-actions-container-stacking">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert amount of STX</label>
              <div className="bottom-margins">
                <input
                  className="custom-input"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseFloat(inputAmount);
                    setIncreaseDelegateAmountInput(inputAmountToInt);
                  }}
                ></input>
              </div>
            </div>
            <div className="button-container-stacking-action-container-stacking">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
                  <MouseOverPopover severityType="info" text={messageDelegate} />
                </span>
                <button
                  className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                  disabled={!delegatedToPool}
                  onClick={() => {
                    if (increaseDelegateAmountInput && delegatedToPool)
                      increaseDelegateAmount(delegatedToPool, increaseDelegateAmountInput);
                  }}
                >
                  Increase delegate
                </button>
              </div>
            </div>
          </div>
          <div className="content-sections-title-info-container leave-pool-button-action-container-stacking">
            <div className="flex-right">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ marginRight: '5px', fontSize: '10px', display: 'flex', marginTop: 'auto' }}>
                  <MouseOverPopover severityType="warning" text={messageUpdateBalances} />
                </span>
                <button
                  className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                  onClick={updateScBalances}
                  disabled={!canCallUpdateBalances}
                >
                  Update Pool Balances
                </button>
              </div>
            </div>
          </div>
          {claimRewardsButtonClicked && showAlertClaimReward && (
            <div className="block-margins-auto alert-container-stacking-actions-container-stacking">
              <Alert
                severity="warning"
                onClose={() => {
                  setClaimRewardsButtonClicked(false);
                  setShowAlertClaimReward(false);
                }}
              >
                The given block height is not claimable. It was already claimed or it was not won by the stacking pool.
              </Alert>
            </div>
          )}
          <div className="flex-container align-items-center input-line-actions-container-stacking">
            <div className="width-55 label-and-input-container-actions-container">
              <label className="custom-label">Insert block height</label>
              <div className="bottom-margins">
                <input
                  className="custom-input"
                  type="number"
                  onChange={(e) => {
                    const inputAmount = e.target.value;
                    const inputAmountToInt = parseInt(inputAmount);
                    if (inputAmountToInt < currentBurnBlockHeight) {
                      setCanCallClaim(true);
                      setClaimRewardsInputAmount(inputAmountToInt);
                    } else {
                      setCanCallClaim(false);
                    }
                  }}
                  max={currentBurnBlockHeight - 1}
                ></input>
              </div>
            </div>
            <div className="button-container-stacking-action-container-stacking">
              <button
                className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
                onClick={claimRewards}
                disabled={!canCallClaim}
              >
                Claim rewards
              </button>
            </div>
          </div>
        </div>
        {currentRole === 'Provider' && (
          <ActionsContainerProviderStacking
            userAddress={userAddress}
            currentBurnBlockHeight={currentBurnBlockHeight}
            currentCycle={currentCycle}
            preparePhaseStartBlockHeight={preparePhaseStartBlockHeight}
            rewardPhaseStartBlockHeight={rewardPhaseStartBlockHeight}
          />
        )}
        {leavePoolButtonClicked && showAlertLeavePool && (
          <div className="block-margins-auto alert-container-stacking-actions-container-stacking">
            <Alert
              severity="warning"
              onClose={() => {
                setLeavePoolButtonClicked(false);
                setShowAlertLeavePool(false);
                setDisableLeavePoolButton(false);
              }}
            >
              You are currently the provider and you can not leave pool. Only a simple stacker can leave the pool.
            </Alert>
          </div>
        )}
        <div className="content-sections-title-info-container leave-pool-button-action-container-stacking">
          <div className="flex-right">
            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={revokeDelegate}
            >
              Revoke delegation
            </button>
          </div>
        </div>
        <div className="content-sections-title-info-container leave-pool-button-action-container-stacking">
          <div className="flex-right">
            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={disallowContractCaller}
            >
              Disallow contract caller
            </button>
          </div>
        </div>
        <div className="content-sections-title-info-container leave-pool-button-action-container-stacking">
          <div className="flex-right">
            <button
              className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
              onClick={leavePool}
              disabled={disableLeavePoolButton}
            >
              Leave Pool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionsContainerStacking;
