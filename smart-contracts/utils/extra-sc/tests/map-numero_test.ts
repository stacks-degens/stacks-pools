import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.3.1/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

const contractName = 'map-numero';
const getNumero = 'get-numero';
const getNumeroBlock = 'get-numero-block';
const setNumero = 'set-numero';
const getBlockHash = 'show-hash-block-id';

// value at blocks 1 2 3 4 5 6 7

Clarinet.test({
  name: 'Ensure that works for current block values',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const admin = accounts.get('deployer')!;

    let numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    numero.result.expectNone();

    let block = chain.mineBlock([
      Tx.contractCall(contractName, setNumero, [types.principal(admin.address), types.uint(22)], admin.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    assertEquals(numero.result.expectSome(), '{value: u22}');

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 3);
    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 4);

    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    assertEquals(numero.result.expectSome(), '{value: u22}');

    block = chain.mineBlock([
      Tx.contractCall(contractName, setNumero, [types.principal(admin.address), types.uint(55)], admin.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 5);

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 6);

    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    assertEquals(numero.result.expectSome(), '{value: u55}');

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 7);

    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);

    assertEquals(numero.result.expectSome(), '{value: u55}');
  },
});

Clarinet.test({
  name: 'Ensure that display block hash right',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const admin = accounts.get('deployer')!;

    // display block hash 2 3 4 5

    let blockHash = chain.callReadOnlyFn(contractName, getBlockHash, [types.uint(1)], admin.address);
    // numero.result.expectNone();

    let block = chain.mineBlock([
      Tx.contractCall(contractName, setNumero, [types.principal(admin.address), types.uint(22)], admin.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 3);
    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 4);

    block = chain.mineBlock([
      Tx.contractCall(contractName, setNumero, [types.principal(admin.address), types.uint(55)], admin.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 5);

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 6);

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 7);

    blockHash = chain.callReadOnlyFn(contractName, getBlockHash, [types.uint(2)], admin.address);
    // assertEquals(numero.result.expectSome(), "{value: u22}");

    blockHash = chain.callReadOnlyFn(contractName, getBlockHash, [types.uint(4)], admin.address);
    // assertEquals(numero.result.expectSome(), "{value: u22}");

    blockHash = chain.callReadOnlyFn(contractName, getBlockHash, [types.uint(6)], admin.address);
    // assertEquals(numero.result.expectSome(), "{value: u55}");

    blockHash = chain.callReadOnlyFn(contractName, getBlockHash, [types.uint(7)], admin.address);

    // assertEquals(numero.result.expectSome(), "{value: u55}");
  },
});

Clarinet.test({
  name: 'Ensure that works for previous block values',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const admin = accounts.get('deployer')!;

    let numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    numero.result.expectNone();

    let block = chain.mineBlock([
      Tx.contractCall(contractName, setNumero, [types.principal(admin.address), types.uint(22)], admin.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    assertEquals(numero.result.expectSome(), '{value: u22}');

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 3);
    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 4);

    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    assertEquals(numero.result.expectSome(), '{value: u22}');

    block = chain.mineBlock([
      Tx.contractCall(contractName, setNumero, [types.principal(admin.address), types.uint(55)], admin.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 5);

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 6);

    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);
    assertEquals(numero.result.expectSome(), '{value: u55}');

    block = chain.mineBlock([]);
    assertEquals(block.receipts.length, 0);
    assertEquals(block.height, 7);

    numero = chain.callReadOnlyFn(contractName, getNumero, [types.principal(admin.address)], admin.address);

    assertEquals(numero.result.expectSome(), '{value: u55}');

    let numero_block = chain.callReadOnlyFn(
      contractName,
      getNumeroBlock,
      [types.principal(admin.address), types.uint(3)],
      admin.address
    );
    assertEquals(numero_block.result.expectSome(), '{value: u22}');

    numero_block = chain.callReadOnlyFn(
      contractName,
      getNumeroBlock,
      [types.principal(admin.address), types.uint(6)],
      admin.address
    );
    assertEquals(numero_block.result.expectSome(), '{value: u55}');
  },
});
