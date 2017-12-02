# Cert Ninja

## Flow

* Customer (C) visits our website
* C fills out form with following info:
  * Ethereum address (A)
  * Which types of validation are desired
  * Corresponding info for each validation type (see below)
* Website calculates how much each validation method will cost, multiplies by profit factor to get invoice amount (in ETH)
* Website issues an invoice which contains following:
  * Invoice amount
  * Ethereum address A
  * Random nonce value
  * r,s,v signature encompassing above values and contract address
* C submits the invoice to the contract
  * If amount sent == invoice amount, then invoice is marked as paid
* Website somehow notices the invoice was paid (told by user, polling chain?)
* Website initiates the verification steps
* Once all the steps are completed, website constructs minified, sorted-keys JSON object (J)
* Website hashes J (JH) and sends message to chain with following:
  * JH
  * A
* Website uploads J to IPFS
* Once tx is mined, user is notified they are verified
* User visits https://cert.ninja/addr/0xblahblah to see flashy certificate
* User calls contract to verify that A maps to JH
