import { appendFileSync, readFileSync, writeFileSync } from 'fs';
const jsonFileName = 'localData.json';
const logFileName = 'log-automation.log';
const eventsFileName = 'events.log';

export enum LogTypeMessage {
  Err = 'ERROR',
  Info = 'INFO',
  Warn = 'WARN',
}

export interface LocalData {
  current_burn_block_height: number;
  current_cycle: number;
  update_balances_txid: string;
  update_balances_burn_block_height: number;
  updated_balances_this_cycle: boolean;
  increase_agg_burn_block_height: number;
  partial_stacked: number;
  commit_agg_this_cycle: boolean;
  commit_agg_txid: string;
  commit_agg_burn_block_height: number;
  distribute_rewards_first_burn_block_height_to_check: number;
  delegated_stack_stx_many_this_cycle: boolean;
  delegated_stack_stx_many_txid: string;
  nonce_to_use: number;
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

// Function to append events to a file synchronously
export const eventData = (messageType: LogTypeMessage, message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${messageType} - ${message}\n`;

  try {
    appendFileSync(eventsFileName, logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};

// when cycle changes, refresh logData
export const refreshJsonData = (newLocalJson: LocalData) => {
  const jsonData = readJsonData();
  jsonData.current_burn_block_height = newLocalJson.current_burn_block_height;
  jsonData.current_cycle = newLocalJson.current_cycle;
  jsonData.updated_balances_this_cycle = false;
  jsonData.update_balances_txid = '';
  jsonData.commit_agg_this_cycle = false;
  jsonData.partial_stacked = 0;
  jsonData.commit_agg_txid = '';
  jsonData.delegated_stack_stx_many_this_cycle = false;
  jsonData.delegated_stack_stx_many_txid = '';
  writeJsonData(jsonData);
};

export const saveErrorLog = (errorContent: string) => {
  const timestamp = new Date().toISOString();
  writeFileSync('./errors/' + timestamp + '.log', errorContent);
};

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
