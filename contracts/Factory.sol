// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./NFT.sol";

contract Factory {
    address[] public contracts;
    mapping(address => address[]) contractsByOwner;

    event ContractCreated(address sender, address contractAddress);

    function createContract(string memory name, string memory symbol)
        public
        returns (address)
    {
        NFT createdContract = new NFT(name, symbol);
        address contractAddress = address(createdContract);
        contracts.push(contractAddress);
        emit ContractCreated(msg.sender, contractAddress);

        createdContract.transferOwnership(msg.sender);
        contractsByOwner[msg.sender].push(contractAddress);

        return contractAddress;
    }

    function listContractsFor(address owner)
        public
        view
        returns (address[] memory)
    {
        return contractsByOwner[owner];
    }

    function listContracts() public view returns (address[] memory) {
        return contracts;
    }
}
