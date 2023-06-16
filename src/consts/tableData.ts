import { useState, useEffect } from 'react';
import {
  ReadOnlyAllDataProposedRemovalMiners,
  ReadOnlyAllDataWaitingMiners,
  ReadOnlyGetMinersList,
  ReadOnlyGetWaitingList,
  readOnlyGetK,
  readOnlyGetNotifierVoteNumber,
} from './readOnly';
import { cvToJSON, ClarityValue } from '@stacks/transactions';

// data interface for all tables, used as type in TableCreation

export interface AllTableData {
  id: number;
  address: string;
  negativeVotes: string;
  vote: string;
  positiveVotes: string;
  wasBlacklisted: string;
  proposeRemoval: string;
  notifierVotes: string;
  generalInfo: string;
}

// data for waiting table

export interface WaitingData {
  id: number;
  address: string;
  negativeVotes: string;
  vote: string;
  positiveVotes: string;
  generalInfo: string;
}

interface WaitingColumnData {
  dataKey: keyof WaitingData;
  label: string;
  numeric?: boolean;
  width: number;
}

const createWaitingData = (id: number, address: string, negativeVotes: string, positiveVotes: string) => {
  return { id, address, negativeVotes, positiveVotes };
};

export const waitingColumns: WaitingColumnData[] = [
  {
    width: 400,
    label: 'Address',
    dataKey: 'address',
  },
  {
    width: 130,
    label: 'Negative Votes',
    dataKey: 'negativeVotes',
    numeric: true,
  },
  {
    width: 120,
    label: 'Positive Votes',
    dataKey: 'positiveVotes',
    numeric: true,
  },
  {
    width: 120,
    label: 'Vote',
    dataKey: 'vote',
    numeric: true,
  },
  {
    width: 120,
    label: 'Miner Info',
    dataKey: 'generalInfo',
  },
];

export const GetWaitingRows = () => {
  const [waitingList, setWaitingList] = useState<any>([]);
  const [addressList, setAddressList] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const fullWaitingList = await ReadOnlyGetWaitingList();
      const newWaitingList = await ReadOnlyAllDataWaitingMiners(fullWaitingList);
      setWaitingList(newWaitingList.newResultList);
      setAddressList(newWaitingList.newAddressList);
    };
    fetchData();
  }, []);

  const rows =
    waitingList.length !== 0
      ? waitingList.map((miner: ClarityValue, index: number) => {
          const waitingValue = cvToJSON(miner).value[0].value.value;
          const waitingAddress = cvToJSON(addressList[index]).value[0].value;
          return createWaitingData(
            index,
            waitingAddress,
            waitingValue['neg-votes'].value + '/' + waitingValue['neg-thr'].value,
            waitingValue['pos-votes'].value + '/' + waitingValue['pos-thr'].value
          );
        })
      : [];

  return rows;
};

// data for miners in pool table

export interface MinersData {
  id: number;
  address: string;
  proposeRemoval: string;
  generalInfo: string;
}

interface MinersColumnData {
  dataKey: keyof MinersData;
  label: string;
  numeric?: boolean;
  width: number;
}

const createMinersData = (id: number, address: string) => {
  return { id, address };
};

export const minerColumns: MinersColumnData[] = [
  {
    width: 400,
    label: 'Address',
    dataKey: 'address',
  },
  {
    width: 150,
    label: 'Propose Removal',
    dataKey: 'proposeRemoval',
    numeric: true,
  },
  {
    width: 120,
    label: 'Miner Info',
    dataKey: 'generalInfo',
    numeric: true,
  },
];

export const GetMinersRows = () => {
  const [minersList, setMinersList] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const newMinersList = await ReadOnlyGetMinersList();
      setMinersList(newMinersList.value);
    };
    fetchData();
  }, []);

  const rows =
    minersList.length !== 0
      ? minersList.map((miner: { value: string }, index: number) => {
          const minerValue = miner.value;
          return createMinersData(index, minerValue);
        })
      : [];

  return rows;
};

// data for removals table

export interface RemovalsData {
  id: number;
  address: string;
  negativeVotes: string;
  vote: string;
  positiveVotes: string;
  generalInfo: string;
}

interface RemovalsColumnData {
  dataKey: keyof RemovalsData;
  label: string;
  numeric?: boolean;
  width: number;
}

const createRemovalsData = (id: number, address: string, negativeVotes: string, positiveVotes: string) => {
  return { id, address, negativeVotes, positiveVotes };
};

export const removalsColumns: RemovalsColumnData[] = [
  {
    width: 400,
    label: 'Address',
    dataKey: 'address',
  },
  {
    width: 130,
    label: 'Negative Votes',
    dataKey: 'negativeVotes',
    numeric: true,
  },
  {
    width: 120,
    label: 'Positive Votes',
    dataKey: 'positiveVotes',
    numeric: true,
  },
  {
    width: 120,
    label: 'Vote',
    dataKey: 'vote',
    numeric: true,
  },
  {
    width: 120,
    label: 'Miner Info',
    dataKey: 'generalInfo',
    numeric: true,
  },
];

interface RemovalsListProps {
  value: {
    value: {
      value: {
        'neg-thr': { value: string };
        'pos-thr': { value: string };
        'vts-against': { value: string };
        'vts-for': { value: string };
      };
    };
  }[];
}

export const GetRemovalsRows = () => {
  const [removalsList, setRemovalsList] = useState<any>([]);
  const [addressList, setAddressList] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const newRemovalsList = await ReadOnlyAllDataProposedRemovalMiners();
      setRemovalsList(newRemovalsList.newResultList);
      setAddressList(newRemovalsList.newAddressList);
    };
    fetchData();
  }, []);

  const rows =
    removalsList.length !== 0
      ? removalsList.map((miner: RemovalsListProps, index: number) => {
          const removalsValue = miner.value[0].value.value;
          return createRemovalsData(
            index,
            addressList[index].value[0].value,
            removalsValue['vts-against'].value + '/' + removalsValue['neg-thr'].value,
            removalsValue['vts-for'].value + '/' + removalsValue['pos-thr'].value
          );
        })
      : [];

  return rows;
};

// data for notifier voting miners

export interface NotifiersData {
  id: number;
  address: string;
  notifierVotes: string;
  vote: string;
  generalInfo: string;
}

interface NotifiersColumnData {
  dataKey: keyof NotifiersData;
  label: string;
  numeric?: boolean;
  width: number;
}

const createNotifiersData = (id: number, address: string, notifierVotes: string) => {
  return { id, address, notifierVotes };
};

export const notifierColumns: NotifiersColumnData[] = [
  {
    width: 400,
    label: 'Address',
    dataKey: 'address',
  },
  {
    width: 150,
    label: 'Votes/Threshold',
    dataKey: 'notifierVotes',
    numeric: true,
  },
  {
    width: 150,
    label: 'Vote',
    dataKey: 'vote',
    numeric: true,
  },
  {
    width: 120,
    label: 'Miner Info',
    dataKey: 'generalInfo',
    numeric: true,
  },
];

export const GetNotifiersRows = async (minersList: any, notifierVoteThreshold: number) => {
  // const getNotifierVotes = async (address: string) => {
  //   const votes = await readOnlyGetNotifierVoteNumber(address);
  //   console.log(votes);
  //   return votes;
  // };

  const getNotifierVotes = async () => {
    const fullInfo =
      minersList.length !== 0
        ? await Promise.all(
            minersList.map(async (miner: { value: string }, index: number) => {
              const minerValue = miner.value;
              const votes = await readOnlyGetNotifierVoteNumber(minerValue);
              return { index, minerValue, votes };
            })
          )
        : [];
    return fullInfo;
  };

  const rows = await getNotifierVotes();

  const newRows =
    rows.length !== 0
      ? rows.map((notifier: { index: number; minerValue: string; votes: number }) => {
          return createNotifiersData(notifier.index, notifier.minerValue, notifier.votes + '/' + notifierVoteThreshold);
        })
      : [];

  return newRows;
};
