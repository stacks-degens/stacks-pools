import colors from '../../../consts/colorPallete';
import { Box } from '@mui/material';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentTheme, selectCurrentUserRole } from '../../../redux/reducers/user-state';
import { useEffect, useState } from 'react';
import { readOnlyGetRemainingBlocksJoin } from '../../../consts/readOnly';
import { ContractAddPending } from '../../../consts/smartContractFunctions';

const PendingMinerProfile = () => {
  // const currentRole = useAppSelector(selectCurrentUserRole);
  // const [blocksLeftUntilJoin, setBlocksLeftUntilJoin] = useState<number | null>(null);

  // const appCurrentTheme = useAppSelector(selectCurrentTheme);

  // useEffect(() => {
  //   const fetchBlocksLeft = async () => {
  //     const blocksLeft = await readOnlyGetRemainingBlocksJoin();
  //     setBlocksLeftUntilJoin(blocksLeft);
  //   };
  //   fetchBlocksLeft();
  // }, [blocksLeftUntilJoin]);

  return (
    <></>
    // <Box
    //   sx={{
    //     minHeight: 'calc(100vh - 60px)',
    //     backgroundColor: colors[appCurrentTheme].accent2,
    //     color: colors[appCurrentTheme].secondary,
    //     marginTop: -2.5,
    //   }}
    // >
    //   <div>
    //     <ul>
    //       <li>
    //         current role: <div>{currentRole}</div>
    //       </li>
    //       <li>
    //         blocks until you join pool:
    //         <div>{blocksLeftUntilJoin !== null && blocksLeftUntilJoin}</div>
    //       </li>
    //       <li>
    //         <button
    //           disabled={blocksLeftUntilJoin === 0 && currentRole === 'Pending' ? false : true}
    //           className="minerProfileButtons"
    //           onClick={() => {
    //             ContractAddPending();
    //           }}
    //         >
    //           join pool from pending to miners
    //         </button>
    //       </li>
    //     </ul>
    //   </div>
    // </Box>
  );
};

export default PendingMinerProfile;
