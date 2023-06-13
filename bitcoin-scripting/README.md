# Taproot transactions for miners

## Work in progress

- [ ] all scripts related to a miner should be different ( funds could be at risk otherwise )

  - [ ] user has to create the script which
    - [ ] can be used after it is signed by X
    - [ ] can be used after an exact block ( current block + 10 ) and it is signed by him
      - this way is it always a different script because of the block value

- ~~ [ ] spend the sum of all the funds of the scripts ~~
- [x] spend the most amount from a prev out value

- [ ] get op_codes for the lock_time script

- [ ] each user will send an amount to the script in order to also have to pay the gases from it
  - [ ] get a method to select a convenable fee OR a standardized amount for all the users from the SC
