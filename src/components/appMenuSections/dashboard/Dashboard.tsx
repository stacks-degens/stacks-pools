import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectAction } from '../../../redux/actions';
import { selectCurrentUserRole, selectUserSessionState, UserRole } from '../../../redux/reducers/user-state';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import { ContractAskToJoin } from '../../../consts/smartContractFunctions';
import {
  readOnlyGetBlocksWon,
  ReadOnlyGetMinersList,
  readOnlyGetNotifier,
  readOnlyGetStacksRewards,
} from '../../../consts/readOnly';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const Dashboard = () => {
  const [authenticatedSuccessfully, setAuthenticatedSuccessfully] = useState<boolean>(false);
  const [clickedJoinPoolButtonByViewer, setClickedJoinPoolButtonByViewer] = useState<boolean>(false);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [minersList, setMinersList] = useState<Array<string>>([]);
  const { currentTheme } = useCurrentTheme();
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [blocksWon, setBlocksWon] = useState<number | null>(null);
  const [stacksRewards, setStacksRewards] = useState<number | null>(null);
  const userSession = useAppSelector(selectUserSessionState);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const authenticate = async () => {
    dispatch(connectAction());
  };

  const handleJoinPoolButtonByViewer = async () => {
    setClickedJoinPoolButtonByViewer(true);
    if (currentRole === 'Viewer') {
      try {
        await authenticate();
      } catch (error) {
        console.log('error trying to authenticate');
        console.log(error);
      }
    } // TODO: change navigate with the corresponding join pool function
    else if (currentRole === 'Miner') navigate('/myProfile');
  };

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, [currentNotifier]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const args = userSession.loadUserData().profile.stxAddress.testnet;
      console.log('address', args);
      setUserAddress(args);
    } else {
      console.log('not signed in');
    }
  }, [userAddress]);

  useEffect(() => {
    const getMinersList = async () => {
      const { value } = await ReadOnlyGetMinersList();
      const parsedMinersList = value.length !== 0 ? value.map((miner: any) => miner.value) : [];
      setMinersList(parsedMinersList);
    };

    getMinersList();
  }, [minersList]);

  useEffect(() => {
    if (currentRole === 'Viewer') {
      setAuthenticatedSuccessfully(false);
    } else {
      //TODO: if you are a miner, what should do this button? should it display leave pool?
      //if so, change the logic of this if block and the display condition of the Join Pool button
      setAuthenticatedSuccessfully(true);
      setClickedJoinPoolButtonByViewer(false);
    }
  }, [currentRole]);

  useEffect(() => {
    const getBlocksWon = async () => {
      const blocks = await readOnlyGetBlocksWon();
      setBlocksWon(blocks);
    };
    getBlocksWon();
  }, [blocksWon]);

  useEffect(() => {
    const getStacksRewards = async () => {
      const stacks = await readOnlyGetStacksRewards();
      setStacksRewards(stacks);
    };
    getStacksRewards();
  }, [stacksRewards]);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: colors[currentTheme].accent2,
        color: colors[currentTheme].secondary,
        marginTop: -2.5,
      }}
    >
      <div>
        <h2>Dashboard</h2>
        <h4>General info about mining pool</h4>
        <ul>
          <li>
            notifier: <div>{currentNotifier !== null ? currentNotifier : ''}</div>
          </li>
          <li>
            list of miners:
            {minersList.length !== 0 && minersList.map((data: string, index: number) => <div key={index}>{data}</div>)}
          </li>
          {currentRole === 'NormalUser' && <li>winner block id</li>}
          {blocksWon !== null && <li>number of blocks won:{blocksWon} </li>}
          {stacksRewards !== null && <li>stacks rewards:{stacksRewards} </li>}
        </ul>
        {currentRole !== 'Miner' && !clickedJoinPoolButtonByViewer && (
          <Button
            variant="contained"
            onClick={() => {
              if (currentRole === 'Viewer') {
                handleJoinPoolButtonByViewer();
              } else if (currentRole === 'NormalUser' || 'Miner') {
                ContractAskToJoin(`${userAddress}`);
              }
            }}
          >
            Join pool
          </Button>
        )}
        {clickedJoinPoolButtonByViewer && authenticatedSuccessfully === false && (
          <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined">
            JOIN POOL
          </LoadingButton>
        )}
      </div>
    </Box>
  );
};

export default Dashboard;
