import { appendFileSync, readFileSync, writeFileSync } from 'fs';
const jsonFileName = 'localData.json';
const logFileName = 'log-automation.log';

export enum LogTypeMessage {
  Err = 'ERROR',
  Info = 'INFO',
  Warn = 'WARN',
}

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
  const rawdata: string = readFileSync(jsonFileName, 'utf8');
  return JSON.parse(rawdata);
};

// add nice write format for readibility
export const writeJsonData = (updatedJson: LocalData) => {
  writeFileSync(jsonFileName, JSON.stringify(updatedJson, null, 2));
};

// Function to append logs to a file synchronously
export const logData = (messageType: LogTypeMessage, message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${messageType} - ${message}\n`;

  try {
    appendFileSync(logFileName, logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};

// when cycle changes, refresh logData
export const refreshJsonData = () => {
  const logData = readJsonData();
  logData.updated_balances_this_cycle = false;
  logData.update_balances_txid = "";
  logData.commit_agg_this_cycle = false;
  logData.partial_stacked = 0;
  writeJsonData(logData);
}

// test logs
// logData(LogTypeMessage.Err, 'something');
// logData(LogTypeMessage.Warn, 'something');
// logData(LogTypeMessage.Info, 'something');

/// test file read - write
// const testIncrementBurnBlockHeight = (): void => {
//   let jsonData = readJsonData();
//   jsonData.current_burn_block_height += 1;
//   writeJsonData(jsonData);
// };
// testIncrementBurnBlockHeight();
// testIncrementBurnBlockHeight();
// writeJsonData(readJsonData());
