use std::str::FromStr;

use bitcoin::{
    secp256k1::{rand::rngs::OsRng, Secp256k1, SecretKey},
    Address,
};

#[test]
fn generate_keys() {
    let mut rng = OsRng;
    let secret1 = SecretKey::new(&mut rng);
    let secret2 = SecretKey::new(&mut rng);
    let secret3 = SecretKey::new(&mut rng);

    println!("New private key: {:?}", secret1.display_secret());
    println!("New private key: {:?}", secret2.display_secret());
    println!("New private key: {:?}", secret3.display_secret());
}

#[test]
fn import_keys_to_use_and_show_p2tr_address() {
    let secret1 =
        SecretKey::from_str("cf7b94f95d3657d4645abb9cbeb3a1bae2c05d61e70b28bb7a5d302d2187e668")
            .unwrap();
    let secret2 =
        SecretKey::from_str("aa974315f2987dfd95b73fcd418e04cecbdfdf4f6c8cf8402db130153cd7986b")
            .unwrap();
    let secret3 =
        SecretKey::from_str("f2121892798ccb2ec9843b48dc73c40354d44a62d47ce8bbe60c64bde352f27a")
            .unwrap();

    println!("New private key: {:?}", secret1.display_secret());
    println!("New private key: {:?}", secret2.display_secret());
    println!("New private key: {:?}", secret3.display_secret());

    // generated them based on the tree with bob and alice used
    let address1 =
        Address::from_str("tb1palqykel4jz6mvknee56gayxwsu44853s0xksc2zps470vs5e9vtqykj7fm");
    let address2 =
        Address::from_str("tb1p7ekmcw5ef3qkdx0jyezv227qt888k3evg4mpx9ec7wjsacr2d4pszp0uef");
    let address3 =
        Address::from_str("tb1pu3t3dvccqxt5ffdk5fclngvurvrxfg5rnx0l3vxt039fdlde5cmszw3sem");

    // let address = Address::p2tr(&secp, x_only, None, NETWORK);
}

// fund the taproot_address that is related to each of the above secret keys
