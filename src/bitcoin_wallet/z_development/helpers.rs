use bitcoin::{
    blockdata::{opcodes::all, script::Builder},
    secp256k1::{All, Secp256k1},
    util::taproot::TaprootBuilder,
    Address, KeyPair, Network, OutPoint, Script, Sequence, Transaction, TxIn, Witness,
    XOnlyPublicKey,
};
use electrum_client::{Client, ElectrumApi};

// working
// branch refund after x blocks
// alice case
pub fn create_script_refund(
    alice_public_key: &XOnlyPublicKey,
    unlock_block: usize,
) -> bitcoin::Script {
    // 144 OP_CHECKSEQUENCEVERIFY OP_DROP <pubkey_alice> OP_CHECKSIG

    Builder::new()
        // .push_int(3)
        // .push_opcode(all::OP_CSV)
        .push_int(unlock_block as i64)
        .push_opcode(all::OP_CLTV) // TODO: replace with OP_CLTV and add unlock_block (10 blocks from current moment)
        .push_opcode(all::OP_DROP)
        .push_x_only_key(alice_public_key)
        .push_opcode(all::OP_CHECKSIG)
        .into_script()

    // the x blocks are relative to the deployment moment
    // to make scripts different, can be used the fixed time and provided the exact block when to unlock
    // will be needed a method to communicate between miners so that the notifier knows which scripts it should include

    // Script::from_hex(
    //     "029000b275209997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803beac",
    // )
    // .unwrap()
}

// working
// branch spending, only checking the
// bob case
pub fn create_script_pox(bob_public_key: &XOnlyPublicKey) -> bitcoin::Script {
    // <pubkey_bob> OP_CHECKSIG
    Builder::new()
        .push_x_only_key(bob_public_key)
        .push_opcode(all::OP_CHECKSIG)
        .into_script()
}

// unspendable script
pub fn create_script_unspendable() -> bitcoin::Script {
    Builder::new().push_opcode(all::OP_RETURN).into_script()
}

// working
// function that creates tree
// in: scripts for branches
// out: tree script
pub fn create_tree(
    secp: &Secp256k1<All>,
    internal: &KeyPair,
    branch_1: &Script,
    branch_2: &Script,
) -> (bitcoin::util::taproot::TaprootSpendInfo, bitcoin::Address) {
    let builder =
        TaprootBuilder::with_huffman_tree(vec![(1, branch_1.clone()), (1, branch_2.clone())])
            .unwrap();

    let (internal_public_key, _) = internal.x_only_public_key();

    // let tap_tree = TapTree::try_from(builder).unwrap();
    let tap_info = builder.finalize(secp, internal_public_key).unwrap();

    // let merkle_root = tap_info.merkle_root(); // not used here

    let address = Address::p2tr(
        secp,
        tap_info.internal_key(),
        tap_info.merkle_root(),
        Network::Testnet,
    );

    (tap_info, address)
}

pub fn get_current_block_height(client: &Client) -> usize {
    client.block_headers_subscribe().unwrap().height
}

pub fn get_prev_txs(
    client: &Client,
    address: &Address,
) -> (
    std::vec::Vec<bitcoin::TxIn>,
    std::vec::Vec<bitcoin::Transaction>,
) {
    let vec_tx_in: Vec<TxIn> = client
        .script_list_unspent(&(address.script_pubkey()))
        .unwrap()
        .iter()
        .map(|l| TxIn {
            previous_output: OutPoint::new(l.tx_hash, l.tx_pos.try_into().unwrap()),
            script_sig: Script::new(),
            sequence: Sequence(0xFFFFFFFF),
            witness: Witness::default(),
        })
        .collect();

    let prev_tx = vec_tx_in
        .iter()
        .map(|tx_id| client.transaction_get(&tx_id.previous_output.txid).unwrap())
        .collect::<Vec<Transaction>>();
    (vec_tx_in, prev_tx)
}

pub fn get_best_amount(prev_tx: &Vec<Transaction>, tx_index: usize, out_index: usize) -> u64 {
    prev_tx[tx_index].output[out_index].value
}

pub fn get_best_prev_to_spend_index(
    prev_tx: Vec<Transaction>,
    address: &Address,
) -> (usize, usize) {
    let mut max_amount = 0;
    // let mut i_tx: u64 = 0;
    // let mut j_out: u64 = 0;
    // let mut max_tx: u64 = 0;
    // let mut max_out: u64 = 0;
    // println!("address: {}", address.script_pubkey());
    // for tx in prev_tx {
    //     j_out = 0;
    //     for out in &tx.output {
    //         println!("script pub key: {}", out.script_pubkey);
    //         if out.script_pubkey.eq(&address.script_pubkey()) && out.value > max_amount {
    //             max_amount = out.value;
    //             max_tx = i_tx;
    //             max_out = j_out;
    //         }
    //         j_out += 1;
    //     }
    //     i_tx += 1;
    // }
    // (max_tx, max_out)

    prev_tx
        .iter()
        .enumerate()
        .flat_map(|(i_tx, tx)| {
            tx.output
                .iter()
                .enumerate()
                .filter_map(move |(j_out, out)| {
                    if out.script_pubkey.eq(&address.script_pubkey()) && out.value > max_amount {
                        max_amount = out.value;
                        Some((i_tx, j_out))
                    } else {
                        None
                    }
                })
        })
        .last()
        .unwrap_or((0, 0))
}

fn get_total_available_amount(prev_tx: &Vec<Transaction>) -> u64 {
    // let mut amount = 0;
    // for tx in prev_tx {
    //     for out in &tx.output {
    //         amount += out.value;
    //     }
    // }
    // amount
    prev_tx
        .iter()
        .flat_map(|tx| tx.output.iter())
        .map(|out| out.value)
        .sum()
    // TODO: filter only for amounts owned by address
}
