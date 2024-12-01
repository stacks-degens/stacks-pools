import axios from 'axios';
import {
  POX_CONTRACT_ADDRESS,
  API_URL,
  LIMIT,
  POX_INFO_URL,
  REWARD_INDEXES_API_URL,
  GET_TRANSACTION_API_URL,
  POOL_CONTRACT_ADDRESS,
  CONTRACT_ADMIN,
  STACKS_NETWORK_INSTANCE,
  STACKS_NETWORK_NAME,
} from './consts';
import {
  hexToCV,
  cvToHex,
  cvToJSON,
  tupleCV,
  uintCV,
  callReadOnlyFunction,
} from '@stacks/transactions';
import { poxAddressToBtcAddress } from '@stacks/stacking';

export const fetchData = async (offset: number): Promise<any> => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        address: POX_CONTRACT_ADDRESS,
        limit: LIMIT,
        offset: offset,
      },
    });

    return response.data.events;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return fetchData(offset);
      } else {
        console.error(`Error: ${error}`);
      }
    } else {
      console.error(`Error: ${error}`);
    }
    return null;
  }
};

export const fetchPoxInfo = async (): Promise<any> => {
  try {
    const response = await axios.get(POX_INFO_URL);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return fetchPoxInfo();
      } else {
        console.error(`Error fetching PoX info: ${error}`);
      }
    } else {
      console.error(`Error fetching PoX info: ${error}`);
    }
    return null;
  }
};

export const fetchRewardCycleIndex = async (
  rewardCycle: number,
  index: number
): Promise<any> => {
  try {
    const data = cvToHex(
      tupleCV({ 'reward-cycle': uintCV(rewardCycle), index: uintCV(index) })
    );

    const response = await axios.post(REWARD_INDEXES_API_URL, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return cvToJSON(hexToCV(response.data.data));
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return fetchRewardCycleIndex(rewardCycle, index);
      } else {
        console.error(`Error fetching reward cycle index info: ${error}`);
      }
    } else {
      console.error(`Error fetching reward cycle index info: ${error}`);
    }
    return null;
  }
};

export const fetchTransactionInfo = async (txid: string): Promise<any> => {
  try {
    const response = await axios.get(GET_TRANSACTION_API_URL(txid));

    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status !== 404) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return fetchTransactionInfo(txid);
      } else if (error.response.status === 404) {
        return null;
      } else {
        console.error(`Error fetching transaction info: ${error}`);
      }
    } else {
      console.error(`Error fetching transaction info: ${error}`);
    }
    return null;
  }
};

export const getContractRewardAddress = async () => {
  const [contractAddress, contractName] = POOL_CONTRACT_ADDRESS.split('.');
  const senderAddress = CONTRACT_ADMIN || '';
  const functionName = 'get-pool-pox-address';

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [],
    network: STACKS_NETWORK_INSTANCE,
    senderAddress,
  };

  const addressCV = await callReadOnlyFunction(options);
  const rawAddress = cvToJSON(addressCV).value;

  return poxAddressToBtcAddress(
    parseInt(rawAddress.version.value),
    Uint8Array.from(Buffer.from(rawAddress.hashbytes.value.slice(2), 'hex')),
    STACKS_NETWORK_NAME
  );
};

export const getContractAdmin = async () => {
  const [contractAddress, contractName] =
    POOL_CONTRACT_ADDRESS.split('.');
  const senderAddress = CONTRACT_ADMIN || '';
  const functionName = 'get-contributor-admin';

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [],
    network: STACKS_NETWORK_INSTANCE,
    senderAddress,
  };

  const adminCV = await callReadOnlyFunction(options);
  return cvToJSON(adminCV).value;
};
