// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

abstract contract Owner {
    address private _contractOwner; // Account used to deploy contract

    constructor() {
        _contractOwner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _contractOwner, "Caller is not contract owner");
        _;
    }
}
