import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v1.6.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

const ammSwapPoolContract = "amm-swap-pool-v1-1";
const wrappedBitcoinContract = "Wrapped-Bitcoin";
const alexVaultContract = "alex-vault-v1-1";
const bridgeContract = "bridge-contract";
const createPool = "create-pool";
const initializeWrappedBitcoinSC = "initialize";
const setMaxInRatio = "set-max-in-ratio";
const setMaxOutRatio = "set-max-out-ratio";
const setPoolStartBlock = "set-start-block";
const getPoolDetails = "get-pool-details";
const addPrincipalToRole = "add-principal-to-role";
const setApprovedSC = "set-approved-contract";
const setApprovedToken = " set-approved-token";
const bridgeSwapFn = "swap-helper";
const minterRole = 1;
const mintWrappedBitcoin = "mint-tokens";
const wrappedBitcoinTokenName = "Wrapped Bitcoin";
const wrappedBitcoinSymbol = "xBTC";
const wrappedBitcoinDecimals = 8;

const to_one_8 = (amount) => {
  return amount * 100_000_000;
};
const div_one_8 = (amount) => {
  return amount / 100_000_000;
};

Clarinet.test({
  name: "Creating a trading pool and exchanging with Deployer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    // Prerequirements
    // 1. Wrapped-Bitcoin
    // a. Initialize the Wrapped-Bitcoin contract (token-name, symbol, decimals, owner)
    // b. Add minter role for deployer in order to mint
    let block = chain.mineBlock([
      Tx.contractCall(
        wrappedBitcoinContract,
        initializeWrappedBitcoinSC,
        [
          types.ascii(wrappedBitcoinTokenName),
          types.ascii(wrappedBitcoinSymbol),
          types.uint(wrappedBitcoinDecimals),
          types.principal(deployer.address),
        ],
        deployer.address
      ),
      Tx.contractCall(
        wrappedBitcoinContract,
        addPrincipalToRole,
        [types.uint(minterRole), types.principal(deployer.address)],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 3);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);

    // c. Mint resources in order to create the trading pool
    block = chain.mineBlock([
      Tx.contractCall(
        wrappedBitcoinContract,
        mintWrappedBitcoin,
        [
          types.uint(to_one_8(12)), // 12 BTC
          types.principal(deployer.address),
        ],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 4);
    block.receipts[0].result.expectOk().expectBool(true);

    // 2. alex-vault-v1-1
    // a. Set Approved Contract: amm-swap-pool-v1-1
    // b. Approve tokens: .wbtc, .wstx
    block = chain.mineBlock([
      Tx.contractCall(
        alexVaultContract,
        setApprovedSC,
        [
          types.principal(`${deployer.address}.amm-swap-pool-v1-1`),
          types.bool(true),
        ],
        deployer.address
      ),
      Tx.contractCall(
        alexVaultContract,
        setApprovedToken,
        [types.principal(`${deployer.address}.token-wbtc`), types.bool(true)],
        deployer.address
      ),
      Tx.contractCall(
        alexVaultContract,
        setApprovedToken,
        [types.principal(`${deployer.address}.token-wstx`), types.bool(true)],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 5);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);

    // 2. amm-swap-pool-v1-1
    // a. Create the xBTC - STX trading pool
    // b. Set Max In Ratio
    // c. Set Max Out Ratio
    // d. Set Start Block
    // e. check pool details to be correct
    block = chain.mineBlock([
      Tx.contractCall(
        ammSwapPoolContract,
        createPool,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(100_000_000),
          types.principal(deployer.address),
          types.uint(to_one_8(8)), // 8 BTC
          types.uint(to_one_8(337_796)), // 337_796 STX
        ],
        deployer.address
      ),
      Tx.contractCall(
        ammSwapPoolContract,
        setMaxInRatio,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(100_000_000),
          types.uint(to_one_8(0.5)), // in ratio == 0.5 == 50% of balance
        ],
        deployer.address
      ),
      Tx.contractCall(
        ammSwapPoolContract,
        setMaxOutRatio,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(100_000_000),
          types.uint(to_one_8(0.5)), // out ratio == 0.5 == 50% of balance
        ],
        deployer.address
      ),
      Tx.contractCall(
        ammSwapPoolContract,
        setPoolStartBlock,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(100_000_000),
          types.uint(1), //start block
        ],
        deployer.address
      ),
      Tx.contractCall(
        ammSwapPoolContract,
        getPoolDetails,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(100_000_000),
        ],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 5);
    assertEquals(block.height, 6);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    block.receipts[3].result.expectOk().expectBool(true);
    console.log("Trading Pool details: ", block.receipts[4].result);

    // 3. bridge-contract
    // a. swap 10_000 sats using the exchange function
    block = chain.mineBlock([
      Tx.contractCall(
        bridgeContract,
        bridgeSwapFn,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(to_one_8(1)), //1 xBTC
          types.uint(5),
        ],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 7);
    block.receipts[0].result.expectOk();
    let StxExchangeResult = block.receipts[0].result.expectOk();
    console.log("1 xBTC == ", StxExchangeResult);
  },
});
