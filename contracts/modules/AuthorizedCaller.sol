// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Owner.sol";

abstract contract AuthorizedCaller is Owner {
    address private _authorizedCaller; // Account used to deploy contract

    modifier onlyAuthorizedCaller() {
        require(msg.sender == _authorizedCaller, "Caller is not authorized");
        _;
    }

    function authorizeCaller(address caller) external onlyOwner {
        _authorizedCaller = caller;
    }
}
