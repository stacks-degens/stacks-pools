import { readFileSync, writeFileSync } from 'fs';

const jsonName = 'localData.json';

interface LocalData {
  current_burn_block_height: number;
  current_prepare_phase: number;
  current_reward_phase: number;
  current_cycle: number;
  updated_balances_this_cycle: boolean;
  commit_agg_this_cycle: boolean;
}

export const readJsonData = (): LocalData => {
  const rawdata: string = readFileSync(jsonName, 'utf8');
  return JSON.parse(rawdata);
};

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
