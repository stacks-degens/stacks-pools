import { readFileSync, writeFileSync } from 'fs';
const jsonName = 'localData.json';

interface LocalData {
  current_burn_block_height: number;
  current_cycle: number;
  update_balances_txid: string;
  update_balances_burn_block_height: number;
  updated_balances_this_cycle: boolean;
  increase_agg_burn_block_height: number;
  partial_stacked: number;
  commit_agg_this_cycle: boolean;
  distribute_rewards_last_burn_block_height: number;
}

export const readJsonData = (): LocalData => {
  const rawdata: string = readFileSync(jsonName, 'utf8');
  return JSON.parse(rawdata);
};

// add nice write format for readibility
export const writeJsonData = (updatedJson: LocalData) => {
  writeFileSync(jsonName, JSON.stringify(updatedJson));
};

/// test file read - write
// const testIncrementBurnBlockHeight = (): void => {
//   let jsonData = readJsonData();
//   jsonData.current_burn_block_height += 1;
//   writeJsonData(jsonData);
// };
// testIncrementBurnBlockHeight();
// testIncrementBurnBlockHeight();
