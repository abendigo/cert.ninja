pragma solidity 0.4.18;

contract CertNinja {
    address private owner;

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
}
