import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectAction } from '../../../redux/actions';
import { selectCurrentUserRole, selectUserSessionState, UserRole } from '../../../redux/reducers/user-state';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import { ContractAskToJoin } from '../../../consts/smartContractFunctions';
import { readOnlyAddressStatus, ReadOnlyGetMinersList, readOnlyGetNotifier } from '../../../consts/readOnly';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { Box } from '@mui/material';

const Dashboard = () => {
  const [authenticatedSuccessfully, setAuthenticatedSuccessfully] = useState<boolean>(false);
  const [clickedJoinPoolButtonByViewer, setClickedJoinPoolButtonByViewer] = useState<boolean>(false);
  const [currentNotifier, setCurrentNotifier] = useState<string>();
  const [minersList, setMinersList] = useState<any>([]);
  const { currentTheme } = useCurrentTheme();
  const currentRole: UserRole = useAppSelector(selectCurrentUserRole);
  const [userAddress, setUserAddress] = useState<number | null>(null);
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

  const handleJoinPoolButtonByNormalUser = () => {
    alert('I am a normal user and now the join pool button should do something accordingly to my role');
    // TODO: change navigate with the corresponding join pool function as a normal user
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
      // console.log('current', value);
      const parsedMinersList = value.map((miner: any) => miner.value);
      // console.log('parsed', parsedMinersList);
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
        {/* <h4>General info about Stacks - widgets/statistics</h4>
        <ul>
          <li>stacks rewards</li>
          <li>miners</li>
          <li>blocks</li>
        </ul> */}
        <h4>General info about mining pool</h4>
        <ul>
          <li>
            notifier: <div>{currentNotifier}</div>
          </li>
          <li>
            list of miners:
            {minersList.map((data: string, index: number) => (
              <div key={index}>{data}</div>
            ))}
          </li>
          {currentRole === 'NormalUser' && <li>winner block id</li>}

          <li>number of blocks won</li>
          <li>stacks rewards</li>
        </ul>
        {currentRole !== 'Miner' && !clickedJoinPoolButtonByViewer && (
          <Button
            variant="contained"
            onClick={() => {
              if (currentRole === 'Viewer') {
                handleJoinPoolButtonByViewer();
              } else if (currentRole === 'NormalUser' || 'Miner') {
                // ContractAskToJoin('ST2ST2H80NP5C9SPR4ENJ1Z9CDM9PKAJVPYWPQZ50');
                ContractAskToJoin(`${userAddress}`);
                handleJoinPoolButtonByNormalUser();
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
