// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./modules/Owner.sol";
import "./modules/Operational.sol";
import "./modules/AuthorizedCaller.sol";

contract FlightSuretyData is Owner, Operational, AuthorizedCaller {
    using SafeMath for uint256;

    address[] airlines;

    constructor() {}

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     */
    function registerAirline(address airline) external onlyAuthorizedCaller {
        airlines.push(airline);
    }

    /**
     * @dev Buy insurance for a flight
     */
    function buy() external payable {}

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees() external pure {}

    /**
     *  @dev Transfers eligible payout funds to insuree
     */
    function pay() external onlyAuthorizedCaller {}

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     */
    function fund() public payable {}

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     */
    fallback() external payable {
        fund();
    }

    receive() external payable {}
}
