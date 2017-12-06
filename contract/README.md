# CertNinja Smart Contract

## Design Notes
 
* The owner is separate from admin so we don't need to keep the owner private keys on our servers
* Users can validate either a certificate hash or an address
* As well as determining if a certificate is currently valid, users can see if a certificate was valid previously.
* Admins can revoke a certificate if needed.
* Invoices must be paid via the `payInvoice` function. Simply sending funds to contract will fail and funds will be returned.

## Building

Install the `solc` [solidity compiler](https://github.com/ethereum/solidity/releases) somewhere in your path.

Run `make`
