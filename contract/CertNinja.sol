pragma solidity 0.4.18;

contract CertNinja {
    // Storage

    address owner;
    address feeCollector;
    mapping(address => bool) admins;
    mapping(address => bytes32) addressToCertHash;
    mapping(bytes32 => address) certHashToAddress;
    mapping(bytes32 => bool) invoicePaid;


    // Events

    event LogCertify(address indexed account, bytes32 indexed certHash);
    event LogRevoke(address indexed account, bytes32 indexed certHash);
    event LogInvoicePayment(bytes32 indexed invoiceId, address indexed addr, uint amount);


    // Owner interface

    function CertNinja() public {
        owner = msg.sender;
        feeCollector = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function changeOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function changeFeeCollector(address newFeeCollector) external onlyOwner {
        feeCollector = newFeeCollector;
    }

    function addAdmin(address addr) external onlyOwner {
        admins[addr] = true;
    }

    function removeAdmin(address addr) external onlyOwner {
        admins[addr] = false;
    }


    // Admin interface

    modifier onlyAdmin() {
        require(admins[msg.sender]);
        _;
    }

    function certify(address addr, bytes32 certHash) external onlyAdmin {
        require(certHash != bytes32(0));
        addressToCertHash[addr] = certHash;
        certHashToAddress[certHash] = addr;
        LogCertify(addr, certHash);
    }

    function revoke(address addr) external onlyAdmin {
        bytes32 certHash = addressToCertHash[addr];
        addressToCertHash[addr] = bytes32(0);
        LogRevoke(addr, certHash);
    }


    // Fee collector interface

    modifier onlyFeeCollectorOrOwner() {
        require(msg.sender == feeCollector || msg.sender == owner);
        _;
    }

    function collectFees() external onlyFeeCollectorOrOwner {
        feeCollector.transfer(this.balance);
    }


    // Public writeable interface

    function() external payable {
        revert(); // must use payInvoice function to pay invoices
    }

    function payInvoice(bytes32 invoiceId, uint amount, uint64 payBy, uint8 v, bytes32 r, bytes32 s) external payable {
        require(!invoicePaid[invoiceId]);

        uint messageHash = uint(keccak256(this, msg.sender, invoiceId, amount, payBy));
        address signer = ecrecover(keccak256("\x19Ethereum Signed Message:\n32", messageHash), v, r, s);

        require(admins[signer]);
        require(amount == msg.value);
        require(block.timestamp <= payBy);

        invoicePaid[invoiceId] = true;
        LogInvoicePayment(invoiceId, msg.sender, amount);
    }


    // Public read-only interface

    // Returns 0 if address hasn't been certified
    function lookupAddress(address addr) external view returns(bytes32) {
        return addressToCertHash[addr];
    }

    // Returns (0, true) if no such certHash
    // Returns (addr, true) if certHash was found and this is the current up-to-date certHash
    // Returns (addr, false) if this hash was once valid but there is a newer certHash (potentially a revocation)
    function validateCertHash(bytes32 certHash) external view returns(address, bool) {
        address addr = certHashToAddress[certHash];

        if (addr == address(0)) return (0, true);

        return (addr, addressToCertHash[addr] == certHash);
    }

    function isInvoicePaid(bytes32 invoiceId) external view returns(bool) {
        return invoicePaid[invoiceId];
    }
}
