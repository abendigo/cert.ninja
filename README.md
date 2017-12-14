# Cert Ninja

## Flow

* Customer (C) visits our website
* C fills out form with following info:
  * Ethereum address (A)
  * Which types of validation are desired
  * Corresponding info for each validation type (see below)
* Website calculates how much each validation method will cost, multiplies by profit factor to get invoice amount (in ETH)
* Website issues an invoice which contains following:
  * Contract Address
  * Invoice ID (random 256-bit value)
  * Invoice amount
  * Ethereum address A
  * Expiry timestamp
  * r,s,v signature encompassing above values and contract address
* C submits the invoice to the contract
  * If amount sent == invoice amount, then invoice is marked as paid
* Website notices the invoice was paid by polling chain
* User initiates the verification steps
* Once all the steps are completed, website constructs minified, sorted-keys JSON object (J)
* Website also constructs certificate hash CH = sha3(J)
* User is notified they are verified
* User visits https://cert.ninja/address/0xblahblah to see flashy certificate
* Website hashes J (JH) and sends message to chain with following: (TODO)
  * JH
  * A
* Website uploads J to IPFS (TODO)
* User calls contract to verify that A maps to JH (TODO)



## API End-points

* `GET /api/get-rates`
  * Output:
    * prices for each validation method in USD
    * current ETH/USD rate

* `POST /api/create-invoice`
  * Input:
    * eth address
    * values for validation methods
  * Output:
    * invoice data and sig
    * invoice secret
  * Side-effects:
    * adds invoice to our DB
    * sends email to user with invoice secret

* `GET /api/invoice-status`
  * Input:
    * invoice secret
  * Output:
    * whether invoice has been paid
    * status of each validation method

* `POST /api/send-code`
  * Input:
    * invoice secret
    * method (email, phone, sms, snailmail -- domain tho)
  * Side-effects:
    * verify that we haven't sent more than 3 codes
    * generates new code, stores in our DB
    * sends code over phone/sms/snailmail

* `POST /api/verify`
  * Input:
    * invoice secret
    * method (email, phone, sms, snailmail, domain)
    * code
  * Side-effects:
    * increments attempt counter, verifies not more than 3 attempts
    * checks code is correct, if so marks it in db

* `POST /api/complete`
  * Input:
    * invoice secret
  * Output:
    * certificate hash
  * Side-effects:
    * creates certificate, stores in our DB
    ? submits certificate to IPFS
    * submits certificate hash to blockchain

* `GET /api/lookupAddress`
  * Input:
    * eth address
  * Output:
    * certHash

* `GET /api/lookupCertHash`
  * Input:
    * certHash
  * Output:
    * eth address
    * whether this is latest certHash
    * if not, latest certHash
