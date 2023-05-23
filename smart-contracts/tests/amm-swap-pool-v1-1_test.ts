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
const bridgeContract = "bridge-contract";
const createPool = "create-pool";
const initializeWrappedBitcoinSC = "initialize";
const addLiquidity = "add-to-position";
const setMaxInRatio = "set-max-in-ratio";
const setMaxOutRatio = "set-max-out-ratio";
const getPoolDetails = "get-pool-details";
const addPrincipalToRole = "add-principal-to-role";
const bridgeSwapFn = "swap-xbtc-to-stx";
const ownerRole = 0;
const minterRole = 1;
const mintWrappedBitcoin = "mint-tokens";
const wrappedBitcoinTokenName = "Wrapped Bitcoin";
const wrappedBitcoinSymbol = "xBTC";
const wrappedBitcoinDecimals = 8;

const to_one_8 = (amount) => {
  return amount * 100_000_000;
};

Clarinet.test({
  name: "Creating a trading pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

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
    assertEquals(block.height, 2);
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
    assertEquals(block.height, 3);
    block.receipts[0].result.expectOk().expectBool(true);

    // 2. amm-swap-pool-v1-1
    // a. Create the xBTC - STX trading pool
    // b. Set Max In Ratio
    // c. Set Max Out Ratio
    // d. check pool details to be correct
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
          types.uint(to_one_8(4)),
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
          types.uint(to_one_8(300_000)),
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

    assertEquals(block.receipts.length, 4);
    assertEquals(block.height, 4);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    console.log("Trading Pool details: ", block.receipts[3].result);

    // 3. bridge-contract
    // a. swap 10_000 sats using the exchange function
    block = chain.mineBlock([
      Tx.contractCall(
        bridgeContract,
        bridgeSwapFn,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(10000), //10k sats
        ],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 5);
    block.receipts[0].result.expectOk();
    let StxExchangeResult = block.receipts[0].result.expectOk();
    console.log("10k SATS == ", StxExchangeResult);
  },
});
