// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./MultiPartyConsensusOnAddressByAddress.sol";

// TODO count registered airlines, if > 4, then use "registration queue", and "multi-party consensus"
// TODO invoke Data contract registerAirline
abstract contract AppAirlines is MultiPartyConsensusOnAddressByAddress {
    struct Airline {
        // address airline;
        // uint256 votes;
        uint256 funds;
        bool isRegistered;
    }
    mapping(address => Airline) airlines;
    address[] airlinesRegistered;
    uint256 public constant MIN_AIRLINE_FUNDING = 1 ether;

    event AirlineRegistered(address airline);

    constructor() {
        // First airline is registered when contract is deployed
        // (considered as the contract creator/owner)
        _registerAirline(msg.sender);
        _addAirlineFunds(msg.sender, MIN_AIRLINE_FUNDING);
    }

    modifier onlyFullyFundedAirline() {
        require(
            airlines[msg.sender].funds >= MIN_AIRLINE_FUNDING,
            "Airline did not pay enough funds"
        );
        _;
    }

    modifier onlyRegisteredAirline() {
        require(
            airlines[msg.sender].isRegistered,
            "Only existing airlines are allowed"
        );
        _;
    }

    function isAirline(address airline) public view returns (bool) {
        return airlines[airline].isRegistered;
    }

    function payAirlineFunds() external payable {
        _addAirlineFunds(msg.sender, msg.value);
    }

    function airlineFunds() external view returns (uint256) {
        return airlines[msg.sender].funds;
    }

    function registerAirline(address newAirline)
        external
        onlyRegisteredAirline
        onlyFullyFundedAirline
    {
        require(
            !airlines[newAirline].isRegistered,
            "Airline already registered"
        );

        if (airlinesRegistered.length < 4) {
            _registerAirline(newAirline);
            return;
        }

        // req: 2 of 4, 3 of 5, ... etc.
        uint256 minRequiredConsents = (airlinesRegistered.length / 2) +
            (airlinesRegistered.length % 2);

        addPartyConsent(newAirline, msg.sender);

        if (countMultiPartyConsents(newAirline) < minRequiredConsents) return;

        clearMultiPartyConsents(newAirline);
        _registerAirline(newAirline);
    }

    function _registerAirline(address newAirline) private {
        airlines[newAirline].isRegistered = true;
        airlinesRegistered.push(newAirline);
        emit AirlineRegistered(newAirline);
    }

    function _addAirlineFunds(address airline, uint256 value) private {
        airlines[airline].funds += value;
    }
}
