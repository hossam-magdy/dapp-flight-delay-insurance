// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Owner.sol";

// TODO use modifier requireIsOperational on all state-changing functions
abstract contract Operational is Owner {
    bool private _isOperational = true;

    modifier requireIsOperational() {
        // Modify to call data contract's status
        require(_isOperational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    constructor() {}

    function isOperational() external view returns (bool) {
        return _isOperational;
    }

    function setOperatingStatus(bool mode) external onlyOwner {
        _isOperational = mode;
    }
}
