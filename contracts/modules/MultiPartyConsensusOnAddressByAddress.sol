// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Owner.sol";

abstract contract MultiPartyConsensusOnAddressByAddress is Owner {
    mapping(address => address[]) private _consents;

    function addPartyConsent(
        address partyInConsideration,
        address consentFromParty
    ) internal {
        for (uint256 i = 0; i < _consents[partyInConsideration].length; i++) {
            if (consentFromParty == _consents[partyInConsideration][i]) {
                require(false, "Party already gave the consent before");
            }
        }

        _consents[partyInConsideration].push(consentFromParty);
    }

    function clearMultiPartyConsents(address partyInConsideration) internal {
        delete _consents[partyInConsideration];
    }

    function countMultiPartyConsents(address partyInConsideration)
        internal
        view
        returns (uint256)
    {
        return _consents[partyInConsideration].length;
    }
}
