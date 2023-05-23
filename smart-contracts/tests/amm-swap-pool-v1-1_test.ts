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
const createPool = "create-pool";
const initializeWrappedBitcoinSC = "initialize";
const addPrincipalToRole = "add-principal-to-role";
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
    // 1. Initialize the Wrapped-Bitcoin contract (token-name, symbol, decimals, owner)
    // 2. Add minter role for deployer in order to mint
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

    // Mint resources in order to create the trading pool
    block = chain.mineBlock([
      Tx.contractCall(
        wrappedBitcoinContract,
        mintWrappedBitcoin,
        [
          types.uint(to_one_8(8)), //1 BTC
          types.principal(deployer.address),
        ],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 3);
    block.receipts[0].result.expectOk().expectBool(true);

    //Create the xBTC - STX trading pool
    block = chain.mineBlock([
      Tx.contractCall(
        ammSwapPoolContract,
        createPool,
        [
          types.principal(`${deployer.address}.token-wbtc`),
          types.principal(`${deployer.address}.token-wstx`),
          types.uint(100_000_000),
          types.principal(deployer.address),
          types.uint(to_one_8(8)), // 1 BTC
          types.uint(to_one_8(337_796)), // 337_796 STX
        ],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 4);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});
