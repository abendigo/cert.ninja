pragma solidity 0.4.18;

contract CertNinja {
    // Storage

    address private owner;
    mapping(address => bool) private admins;
    mapping(address => bytes32) addressToCertHash;
    mapping(bytes32 => address) certHashToAddress;


    // Owner interface

    function CertNinja() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function changeOwner(address newOwner) external onlyOwner {
        owner = newOwner;
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
    }

    function revoke(address addr) external onlyAdmin {
        addressToCertHash[addr] = bytes32(0);
    }


    // Public interface

    // Returns 0 if address hasn't been certified
    function lookupCertHash(address addr) public view returns(bytes32) {
        return addressToCertHash[addr];
    }

    // Returns (0, true) if no such certHash
    // Returns (addr, true) if address was found and this is the current certHash
    // Returns (addr, false) if there is a newer certHash for this address
    function validateCertHash(bytes32 certHash) public view returns(address, bool) {
        address addr = certHashToAddress[certHash];

        if (addr == address(0)) return (0, true);

        return (addr, addressToCertHash[addr] == certHash);
    }
}
