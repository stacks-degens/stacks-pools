// will split the method into multiple smaller methods accordingly to the flow needed

// create the alice and bob script and the internal key and send my unspent to it

// create transaction that takes the scripts and spends them all togheter

//
//
// each step here
// function that creates OP_CODE scripts for branches

use std::{collections::BTreeMap, str::FromStr};

use bitcoin::{
    blockdata::{block, opcodes::all, script::Builder},
    psbt::{serialize::Serialize, Prevouts, TapTree},
    schnorr::{self, TapTweak},
    secp256k1::{All, Message, Secp256k1, SecretKey},
    util::{
        sighash::{ScriptPath, SighashCache},
        taproot::{ControlBlock, LeafVersion, TaprootBuilder, TaprootSpendInfo},
    },
    Address, KeyPair, LockTime, Network, OutPoint, PackedLockTime, PrivateKey, PublicKey,
    SchnorrSig, SchnorrSighashType, Script, Sequence, Transaction, TxIn, TxOut, Witness,
    XOnlyPublicKey,
};
use bitcoin_hashes::{
    hex::{FromHex, ToHex},
    Hash,
};
// use bitcoin_hashes::serde::Serialize;
use electrum_client::{Client, ElectrumApi};

use crate::bitcoin_wallet::z_development::helpers;

fn create_prev_outputs(prev_tx: &Vec<TxIn>) -> Vec<TxIn> {
    let mut prev_outputs: Vec<TxIn> = vec![];
    for tx in prev_tx {
        prev_outputs.push(TxIn {
            previous_output: tx.previous_output.clone(),
            script_sig: Script::new(),
            sequence: Sequence(0xFFFFFFFF),
            witness: Witness::default(),
        })
    }
    prev_outputs
}

// working
// this will be used only with alice
// bob is used from pox_multisig-payment
fn create_transaction(
    vec_tx_in: &Vec<TxIn>,
    output_address: &Address,
    amount: u64,
    tx_index: usize,
    unlock_block: usize,
) -> Transaction {
    Transaction {
        version: 2,
        lock_time: PackedLockTime(unlock_block as u32),
        // lock_time: LockTime::from_height((unlock_block + 1) as u32)
        //     .unwrap()
        //     .into(),
        input: vec![TxIn {
            previous_output: vec_tx_in[tx_index].previous_output.clone(),
            script_sig: Script::new(),
            // format for sequence to work accordingly to bip-068 (https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki)
            // 0xMNOPQRST
            // M >= 8
            // O is [0, 3] or [8, B]
            // QRST represents relative lock-time ( works with anything ), but should be lock_time converted to hex
            sequence: Sequence(0x8030FFFF),
            witness: Witness::default(),
        }],
        output: vec![TxOut {
            value: amount,
            script_pubkey: output_address.script_pubkey(), // where funds are going
        }],
    }
}

fn verify_p2tr_commitment(
    secp: &Secp256k1<All>,
    script: &Script,
    key_pair_internal: &KeyPair,
    tap_info: &TaprootSpendInfo,
    actual_control: &ControlBlock,
) {
    let tweak_key_pair = key_pair_internal
        .tap_tweak(&secp, tap_info.merkle_root())
        .to_inner();
    let (tweak_key_pair_public_key, _) = tweak_key_pair.x_only_public_key();
    assert!(actual_control.verify_taproot_commitment(secp, tweak_key_pair_public_key, script));
}

fn sign_script_tx(
    secp: &Secp256k1<All>,
    tx_ref: &Transaction,
    prevouts: &Prevouts<TxOut>,
    script: &Script,
    key_pair_user: &KeyPair,
    tap_info: &TaprootSpendInfo,
    key_pair_internal: &KeyPair,
) -> Transaction {
    let mut tx = tx_ref.clone();
    let sighash_sig = SighashCache::new(&mut tx.clone())
        .taproot_script_spend_signature_hash(
            0,
            prevouts,
            ScriptPath::with_defaults(script),
            SchnorrSighashType::AllPlusAnyoneCanPay,
        )
        .unwrap();
    // println!("sighash_sig: {}", sighash_sig);
    // println!("message: {}", Message::from_slice(&sighash_sig).unwrap());
    let sig = secp.sign_schnorr(&Message::from_slice(&sighash_sig).unwrap(), key_pair_user);
    // println!("sig: {}", sig);

    let actual_control = tap_info
        .control_block(&(script.clone(), LeafVersion::TapScript))
        .unwrap();
    // println!("actual_control: {:#?}", actual_control);

    // verify commitment
    verify_p2tr_commitment(secp, script, key_pair_internal, tap_info, &actual_control);

    let schnorr_sig = SchnorrSig {
        sig,
        hash_ty: SchnorrSighashType::AllPlusAnyoneCanPay,
    };

    let wit = Witness::from_vec(vec![
        schnorr_sig.to_vec(),
        script.to_bytes(),
        actual_control.serialize(),
    ]);

    tx.input[0].witness = wit;

    tx
}

fn sign_key_tx(
    secp: &Secp256k1<All>,
    tx_ref: &Transaction,
    prevouts: &Prevouts<TxOut>,
    key_pair_internal: &KeyPair,
    tap_info: &TaprootSpendInfo,
) -> Transaction {
    let mut tx = tx_ref.clone();
    let sighash_sig = SighashCache::new(&mut tx.clone())
        .taproot_key_spend_signature_hash(0, prevouts, SchnorrSighashType::AllPlusAnyoneCanPay) // or All
        .unwrap();

    let tweak_key_pair = key_pair_internal.tap_tweak(secp, tap_info.merkle_root());
    // then sig
    let msg = Message::from_slice(&sighash_sig).unwrap();

    let sig = secp.sign_schnorr(&msg, &tweak_key_pair.to_inner());

    //verify sig
    secp.verify_schnorr(&sig, &msg, &tweak_key_pair.to_inner().x_only_public_key().0)
        .unwrap();

    // then witness
    let schnorr_sig = SchnorrSig {
        sig,
        hash_ty: SchnorrSighashType::AllPlusAnyoneCanPay, // or All
    };

    tx.input[0].witness.push(schnorr_sig.serialize());

    tx
}

#[test]
pub fn test_main() {
    let secp = Secp256k1::new();
    // predefined data
    let secret_key_source =
        SecretKey::from_str("2bd806c97f0e00af1a1fc3328fa763a9269723c8db8fac4f93af71db186d6e90")
            .unwrap();
    // let pox(bob) spend with internal
    let secret_key_pox =
        SecretKey::from_str("81b637d8fcd2c6da6359e6963113a1170de795e4b725b84d1e0b4cfd9ec58ce9")
            .unwrap();
    // let preimage =
    //     Vec::from_hex("107661134f21fc7c02223d50ab9eb3600bc3ffc3712423a1e47bb1f9a9dbf55f").unwrap();

    // data extracted from predefined
    // TODO: will use directly the public key for FORST, no access to its private key before hand
    let key_pair_source = KeyPair::from_secret_key(&secp, &secret_key_source);
    let (xonly_public_key_source, _) = key_pair_source.x_only_public_key();
    let key_pair_pox = KeyPair::from_secret_key(&secp, &secret_key_pox);
    let (xonly_public_key_pox, _) = key_pair_pox.x_only_public_key();
    // let preimage_hash = bitcoin::hashes::sha256::Hash::hash(&preimage);

    let public_key_source =
        PublicKey::from_private_key(&secp, &PrivateKey::new(secret_key_source, Network::Testnet));
    let public_key_pox =
        PublicKey::from_private_key(&secp, &PrivateKey::new(secret_key_pox, Network::Testnet));

    println!(
        "key_pair_source public key {}",
        key_pair_source.public_key()
    );
    println!("bob public key {}", key_pair_pox.public_key());

    // println!("preimage {}", preimage_hash.to_string());

    let client = Client::new("ssl://electrum.blockstream.info:60002").unwrap();
    // get the current block height using the client
    let block_height = helpers::get_current_block_height(&client);

    // write it for 2 blocks from this moment
    // new address is this
    // new object is this
    let unlock_block = 2427365;
    // 2435040;
    //  2424648 + 2; //2427237

    println!("unlock block {}", unlock_block);

    // scripts construction
    let refund_script = helpers::create_script_refund(&xonly_public_key_source, unlock_block);
    let unspendable_script = helpers::create_script_unspendable();
    // let pox_script = helpers::create_script_pox(&xonly_public_key_pox);

    println!("refund script {}", refund_script.to_hex());
    println!("unspendable script {}", unspendable_script.to_hex());
    // println!("pox script {}", pox_script.to_hex());

    let (tap_info, address) =
        helpers::create_tree(&secp, &key_pair_pox, &refund_script, &unspendable_script);

    println!("address {:?}", address);

    // return;

    println!("current block heigh {}", block_height);
    let (vec_tx_in, prev_tx) = helpers::get_prev_txs(&client, &address);

    // creates tx
    // script address
    let output_address =
        Address::from_str("tb1ptnfaxqt25gk9ppunjuz3ex3uw065kya6jefjwkyppd9yu82r8egqxvky3l")
            .unwrap();

    // electrum wallet address
    // let output_address = Address::from_str("tb1q6vgmar6dvshat2eqnkq20nuwrth75pnuz5fk2g").unwrap();

    // gets the best prev out to spend and saves the index of the tx and of the output
    let (best_prev_tx_index, best_prev_out_index) =
        helpers::get_best_prev_to_spend_index(prev_tx.clone(), &address);

    // let total = get_total_available_amount(&prev_tx);
    let total = helpers::get_best_amount(&prev_tx, best_prev_tx_index, best_prev_out_index);
    println!(
        "is lock height {:?}",
        LockTime::from_height(block_height as u32)
    );

    println!("total {}", total);
    println!("packed lock time: {}", PackedLockTime(block_height as u32));

    let fees = 300;
    let amount = total - fees;
    println!("amount this {}", amount);
    let mut tx = create_transaction(
        &vec_tx_in,
        &output_address,
        amount,
        best_prev_tx_index,
        block_height,
    );

    // sign tx
    let prevouts = Prevouts::One(
        0,
        prev_tx[best_prev_tx_index].output[best_prev_out_index].clone(),
    );

    println!("prevouts {:?}", prevouts);

    println!("tx before signing {:?}", tx);

    // refund signing method
    tx = sign_script_tx(
        &secp,
        &tx,
        &prevouts,
        &refund_script,
        &key_pair_source,
        &tap_info,
        &key_pair_pox,
    );

    // pox signing method
    // spend using internal key
    // tx = sign_key_tx(&secp, &tx, &prevouts, &key_pair_pox, &tap_info);

    // broadcast tx
    let tx_id = client.transaction_broadcast(&tx).unwrap();
    println!("transaction hash: {}", tx_id);
}
