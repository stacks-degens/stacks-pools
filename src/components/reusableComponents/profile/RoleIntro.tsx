import './styles.css';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUserRole, UserRole } from '../../../redux/reducers/user-state';
import RoleIntroMiner from './RoleIntroMiner';
import RoleIntroWaiting from './RoleIntroWaiting';
import RoleIntroPending from './RoleIntroPending';
import RoleIntroNormalUser from './RoleIntroNormalUser';

interface IRoleIntro {
  currentRole: string;
  positiveVotes: number | null;
  positiveVotesThreshold: number | null;
  negativeVotes: number | null;
  negativeVotesThreshold: number | null;
  blocksLeftUntilJoin: number | null;
}

const RoleIntro = ({
  currentRole,
  positiveVotes,
  positiveVotesThreshold,
  negativeVotes,
  negativeVotesThreshold,
  blocksLeftUntilJoin,
}: IRoleIntro) => {
  const role: UserRole = useAppSelector(selectCurrentUserRole);

  const roleIntroMapping: Record<UserRole, React.ReactElement> = {
    Viewer: <div></div>,
    NormalUser: <RoleIntroNormalUser currentRole={currentRole} />,
    Waiting: (
      <RoleIntroWaiting
        currentRole={currentRole}
        positiveVotes={positiveVotes}
        positiveVotesThreshold={positiveVotesThreshold}
        negativeVotes={negativeVotes}
        negativeVotesThreshold={negativeVotesThreshold}
      />
    ),
    Pending: <RoleIntroPending currentRole={currentRole} blocksLeftUntilJoin={blocksLeftUntilJoin} />,
    Miner: <RoleIntroMiner currentRole={currentRole} />,
  };

  return (
    <div>
      <div>{roleIntroMapping[role]}</div>
    </div>
  );
};

export default RoleIntro;
