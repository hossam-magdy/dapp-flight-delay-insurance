// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// https://www.quicknode.com/guides/solidity/how-to-call-another-smart-contract-from-your-solidity-code
interface IFlightSuretyData {
    function fund() external payable;

    //

    function registerAirline(address airline) external;

    function countRegisteredAirlines() external view returns (uint256);

    function isRegisteredAirline(address airline) external view returns (bool);

    function addAirlineFunds(address airline, uint256 amount) external payable;

    function airlineFunds(address airline) external view returns (uint256);

    //

    function updateFlightStatus(
        string memory flightNumber,
        address airline,
        uint8 statusCode,
        uint256 timestamp
    ) external;

    function transferInsuranceToCredits(
        string memory flightNumber,
        address airline,
        uint256 MULTIPLY,
        uint256 DIVIDE
    ) external;

    function addInsurance(
        string memory flightNumber,
        address airline,
        address passenger,
        uint256 amount
    ) external payable;

    function queryPurchasedInsurance(
        string memory flightNumber,
        address airline,
        address passenger
    ) external view returns (uint256);

    function queryCredit(address passenger) external view returns (uint256);

    function withdrawCredit(address passenger) external;

    //
}
