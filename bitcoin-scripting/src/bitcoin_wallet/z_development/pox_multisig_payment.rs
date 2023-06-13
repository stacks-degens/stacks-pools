use std::str::FromStr;

use bitcoin::{
    psbt::Prevouts,
    schnorr::TapTweak,
    secp256k1::{All, Message, Secp256k1, SecretKey},
    util::{
        sighash::{ScriptPath, SighashCache},
        taproot::{LeafVersion, TaprootSpendInfo},
    },
    Address, KeyPair, PackedLockTime, SchnorrSig, SchnorrSighashType, Script, Sequence,
    Transaction, TxIn, TxOut, Witness,
};
use electrum_client::{Client, ElectrumApi};

use crate::bitcoin_wallet::z_development::helpers;

// DESCRIPTION
// sent multiple transactions
// have three different alice and 1 bob
// create three taproot scripts and get the p2tr addresses
// transfer 0.3 amount to each of the 3 scripts

// take the inputs and transfer them to third bitcoin address ( from the electrum wallet )
// tb1qcqjutfc7gehglpre2feq8drufj8kyd7ue65ewl

// create transaction
// input 3 scripts amounts
// output tb1qcqjutfc7gehglpre2feq8drufj8kyd7ue65ewl

// sign each transaction using bob
// all should be signed in the same transaction

// broadcast transaction

/// TODO: has to be parsed to the notifier
/// tap_infos and p2tr_addresses
/// the rest is done by the notifier

#[test]
fn test_to_pox() {
    println!("start test to pox");
    let secp = Secp256k1::new();
    /// This will be parsed by participants to the notifier
    // predefined data
    // data extracted from predefined
    // TODO: will use directly the public key for FORST, no access to its private key before hand
    let alice_secrets = [
        SecretKey::from_str("1d799760009ca66cb0ad05a80e5b781deabf0550923fad7ad4417f61702f6353")
            .unwrap(),
        SecretKey::from_str("91436bd90d9cde7ba3162375b7692ae3f22ad01586cb4520bffae48d3a480f6a")
            .unwrap(),
        SecretKey::from_str("25c69df27df3f630daa05a344679474f383bf49e5c577354169f4858484abfe3")
            .unwrap(),
    ];
    let n = 3; // number of miners

    let alice1_secret =
        SecretKey::from_str("1d799760009ca66cb0ad05a80e5b781deabf0550923fad7ad4417f61702f6353")
            .unwrap();
    let alice2_secret =
        SecretKey::from_str("91436bd90d9cde7ba3162375b7692ae3f22ad01586cb4520bffae48d3a480f6a")
            .unwrap();
    let alice3_secret =
        SecretKey::from_str("25c69df27df3f630daa05a344679474f383bf49e5c577354169f4858484abfe3")
            .unwrap();

    let bob_secret =
        SecretKey::from_str("81b637d8fcd2c6da6359e6963113a1170de795e4b725b84d1e0b4cfd9ec58ce9")
            .unwrap();
    let internal_secret =
        SecretKey::from_str("1229101a0fcf2104e8808dab35661134aa5903867d44deb73ce1c7e4eb925be8")
            .unwrap();

    let alice1 = KeyPair::from_secret_key(&secp, &alice1_secret);
    let alice2 = KeyPair::from_secret_key(&secp, &alice2_secret);
    let alice3 = KeyPair::from_secret_key(&secp, &alice3_secret);
    let (alice1_public_key, _) = alice1.x_only_public_key();
    let (alice2_public_key, _) = alice2.x_only_public_key();
    let (alice3_public_key, _) = alice3.x_only_public_key();
    let bob = KeyPair::from_secret_key(&secp, &bob_secret);
    let (bob_public_key, _) = bob.x_only_public_key();
    let internal = KeyPair::from_secret_key(&secp, &internal_secret);
    let (internal_public_key, _) = internal.x_only_public_key();

    println!("alice1 public key {}", alice1.public_key());
    println!("alice2 public key {}", alice2.public_key());
    println!("alice3 public key {}", alice3.public_key());
    println!("bob public key {}", bob.public_key());
    println!("internal public key {}", internal.public_key());

    // println!("preimage {}", preimage_hash.to_string());

    let client = Client::new("ssl://electrum.blockstream.info:60002").unwrap();

    // get the current block height using the client
    // hardcoded, the value for the block_height unlock of the scripts used to send to the PoX
    let unlock_block = 2427365;

    let alice1_script = helpers::create_script_refund(&alice1_public_key, unlock_block);
    let alice2_script = helpers::create_script_refund(&alice2_public_key, unlock_block);
    let alice3_script = helpers::create_script_refund(&alice3_public_key, unlock_block);
    let bob_script = helpers::create_script_pox(&bob_public_key);

    let (tap_info1, address1) = helpers::create_tree(&secp, &internal, &alice1_script, &bob_script);
    let (tap_info2, address2) = helpers::create_tree(&secp, &internal, &alice2_script, &bob_script);
    let (tap_info3, address3) = helpers::create_tree(&secp, &internal, &alice3_script, &bob_script);

    println!("address1 {:?}", address1); // tb1pfw75e20wz02fyk9khp0yptk44ypl034aw3mtd2d5lwhpr9kju75qz5k4yj
    println!("address2 {:?}", address2); // tb1p3hjq6rr3errpwr4tj8s0dz96xyfj9dmq2tax78ag7pcxy497xe9qd6ye6d
    println!("address3 {:?}", address3); // tb1p9n67g6gd6wlnp04juprrhf5xu2020av5rueu793vgwevuwkaznlqkc40k3

    // This will be received by the notifier
    // and processed by him
    let tap_infos = vec![tap_info1, tap_info2, tap_info3];
    let p2tr_addresses = vec![address1, address2, address3];

    // for each p2tr_address we need to get the prev_txs and add it to a vec!

    let (vec_vec_tx_ins, vec_prev_txs): (Vec<_>, Vec<_>) = p2tr_addresses
        .iter()
        .map(|address| helpers::get_prev_txs(&client, &address))
        .unzip();

    let (best_prev_tx_indexes, best_prev_out_indexes): (Vec<usize>, Vec<usize>) = vec_prev_txs
        .iter()
        .zip(p2tr_addresses.iter())
        .map(|(prev_tx, address)| helpers::get_best_prev_to_spend_index(prev_tx.to_vec(), address))
        .unzip();

    // all the inputs with the best tx index from each miner
    let vec_tx_ins = vec_vec_tx_ins
        .iter()
        .enumerate()
        .map(|(i, vec_tx_in)| vec_tx_in[best_prev_tx_indexes[i]].clone())
        .collect::<Vec<TxIn>>();

    let prev_tx_outs = vec_prev_txs
        .iter()
        .enumerate()
        .map(|(i, prev_tx)| {
            prev_tx[best_prev_tx_indexes[i]].output[best_prev_out_indexes[i]].clone()
        })
        .collect::<Vec<TxOut>>();

    println!("prev tx list: {:?}", prev_tx_outs);

    let total: u64 = vec_prev_txs
        .iter()
        .enumerate()
        .map(|(i, prev_tx)| {
            helpers::get_best_amount(prev_tx, best_prev_tx_indexes[i], best_prev_out_indexes[i])
        })
        .sum();

    let fees = 500;
    let amount = total - fees;

    let output_address1 = Address::from_str("tb1qcqjutfc7gehglpre2feq8drufj8kyd7ue65ewl").unwrap();
    let output_address2 = Address::from_str("tb1ql8tz262xlut4uqyyj98d22k6esuu97ayd4ghax").unwrap();

    let mut tx = create_transaction_n_inputs_2_outputs(
        vec_tx_ins,
        &output_address1,
        &output_address2,
        amount,
    );

    // sign tx
    let prevouts = Prevouts::All(&prev_tx_outs);
    // println!("prevouts {:?}", prevouts);
    // println!("tx before signing {:?}", tx);

    tx = sign_tx(
        secp,
        &tx,
        &prevouts,
        &bob_script,
        &bob,
        &tap_infos,
        &internal,
    );

    // broadcast tx
    let tx_id = client.transaction_broadcast(&tx).unwrap();
    println!("transaction hash: {}", tx_id);
}

fn create_txins_array(vec_tx_in: Vec<TxIn>) -> Vec<TxIn> {
    vec_tx_in
        .iter()
        .map(|tx_in| TxIn {
            previous_output: tx_in.previous_output,
            script_sig: Script::new(),
            sequence: Sequence(0xFFFFFFFF),
            witness: Witness::default(),
        })
        .collect()
}

fn create_transaction_n_inputs_2_outputs(
    vec_tx_in: Vec<TxIn>,
    output_address1: &Address,
    output_address2: &Address,
    amount: u64,
) -> Transaction {
    Transaction {
        version: 2,
        lock_time: PackedLockTime(0),
        input: create_txins_array(vec_tx_in),
        output: vec![
            TxOut {
                value: amount / 2,
                script_pubkey: output_address1.script_pubkey(), // where funds are going
            },
            TxOut {
                value: amount / 2,
                script_pubkey: output_address2.script_pubkey(), // where funds are going
            },
        ],
    }
}

fn sign_tx(
    secp: Secp256k1<All>,
    tx_ref: &Transaction,
    prevouts: &Prevouts<TxOut>,
    script: &Script,
    user_key_pair: &KeyPair,
    tap_infos: &[TaprootSpendInfo],
    internal: &KeyPair,
) -> Transaction {
    let mut tx = tx_ref.clone();
    let mut sigs = Vec::new();
    let mut witnesses = Vec::new();

    for (i, (tap_info)) in tap_infos.iter().enumerate() {
        let sighash_sig = SighashCache::new(&mut tx.clone())
            .taproot_script_spend_signature_hash(
                i,
                prevouts,
                ScriptPath::with_defaults(&script.clone()),
                SchnorrSighashType::AllPlusAnyoneCanPay,
            )
            .unwrap();
        let sig = secp.sign_schnorr(&Message::from_slice(&sighash_sig).unwrap(), user_key_pair);

        let actual_control = tap_info
            .control_block(&(script.clone(), LeafVersion::TapScript))
            .unwrap();
        let tweak_key_pair = internal.tap_tweak(&secp, tap_info.merkle_root()).to_inner();
        let (tweak_key_pair_public_key, _) = tweak_key_pair.x_only_public_key();

        // verify commitment
        assert!(actual_control.verify_taproot_commitment(&secp, tweak_key_pair_public_key, script));
        // println!("actual_control: {:#?}", actual_control);

        let schnorr_sig = SchnorrSig {
            sig,
            hash_ty: SchnorrSighashType::AllPlusAnyoneCanPay,
        };

        sigs.push(sig);

        witnesses.push(Witness::from_vec(vec![
            schnorr_sig.to_vec(),
            script.to_bytes(),
            actual_control.serialize(),
        ]));
    }

    for (input, witness) in tx.input.iter_mut().zip(witnesses) {
        input.witness = witness;
    }
    // println!("the complete tx is: {:#?}", tx);

    tx
}
