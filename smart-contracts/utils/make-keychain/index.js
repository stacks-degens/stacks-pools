import {
  generateWallet,
  generateSecretKey,
  generateNewAccount,
  getStxAddress,
} from "@stacks/wallet-sdk";
import { TransactionVersion } from "@stacks/transactions";

const password = "password";

for (let i = 2; i < 292; i++) {
  const secretKey = generateSecretKey();

  let wallet = await generateWallet({
    secretKey,
    password,
  });

  let account = wallet.accounts[0];
  const testnetAddress = getStxAddress({
    account,
    transactionVersion: TransactionVersion.Testnet,
  });

  console.log(`[accounts.wallet_${9 + i}]`);
  console.log(`mnemonic = "${secretKey}"`);
  console.log(`balance = 100_000_000_000_000`);
  console.log(`# stx_address: ${testnetAddress}`);
  console.log();
}

// output:

// [accounts.wallet_x]
// mnemonic = secretKey
// balance = 100_000_000_000_000
// # stx_address: testnetAddress
