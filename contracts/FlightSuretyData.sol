// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IFlightSuretyData.sol";
import "./modules/Owner.sol";
import "./modules/Operational.sol";
import "./modules/AuthorizedCaller.sol";

contract FlightSuretyData is
    IFlightSuretyData,
    Owner,
    Operational,
    AuthorizedCaller
{
    using SafeMath for uint256;

    type StatusCode is uint8;

    struct Flight {
        string flightNumber;
        address airline;
        // bool isRegistered;
        StatusCode statusCode;
        uint256 updatedTimestamp;
    }
    // hash(flightNumber, airline)
    type FlightKey is bytes32;
    mapping(FlightKey => Flight) private _flights;

    //

    mapping(FlightKey => address[]) private _passengersWithInsurance; // paid by passengers
    mapping(FlightKey => mapping(address => uint256)) private _insurances; // paid by passengers
    mapping(address => uint256) private _credits; // credit of passengers

    // ///// Airlines

    struct Airline {
        uint256 funds;
        bool isRegistered;
    }
    mapping(address => Airline) airlines;
    address[] airlinesRegistered;

    function isRegisteredAirline(address airline)
        external
        view
        onlyAuthorizedCaller
        returns (bool)
    {
        return airlines[airline].isRegistered;
    }

    function countRegisteredAirlines()
        external
        view
        onlyAuthorizedCaller
        returns (uint256)
    {
        return airlinesRegistered.length;
    }

    function addAirlineFunds(address airline, uint256 amount)
        external
        payable
        onlyAuthorizedCaller
    {
        airlines[airline].funds = airlines[airline].funds.add(amount);
    }

    function airlineFunds(address airline)
        external
        view
        onlyAuthorizedCaller
        returns (uint256)
    {
        return airlines[airline].funds;
    }

    function registerAirline(address newAirline) external onlyAuthorizedCaller {
        airlines[newAirline].isRegistered = true;
        airlinesRegistered.push(newAirline);
        // emit AirlineRegistered(newAirline);
    }

    ///

    function updateFlightStatus(
        string memory flightNumber,
        address airline,
        uint8 statusCode,
        uint256 timestamp
    ) external onlyAuthorizedCaller {
        FlightKey flightKey = _getFlightKey(flightNumber, airline);

        _flights[flightKey].statusCode = StatusCode.wrap(statusCode);
        _flights[flightKey].updatedTimestamp = timestamp;
    }

    function transferInsuranceToCredits(
        string memory flightNumber,
        address airline,
        // So the 1.5x is changeable by the App/logic contract
        uint256 RATIO_MULTIPLY,
        uint256 RATIO_DIVIDE
    ) external onlyAuthorizedCaller {
        FlightKey flightKey = _getFlightKey(flightNumber, airline);

        for (
            uint256 i = 0;
            i < _passengersWithInsurance[flightKey].length;
            i++
        ) {
            address passenger = _passengersWithInsurance[flightKey][i];
            uint256 insurancePaid = _insurances[flightKey][passenger];
            delete _insurances[flightKey][passenger];
            uint256 creditToAdd = insurancePaid.mul(RATIO_MULTIPLY).div(
                RATIO_DIVIDE
            );
            _credits[passenger] = _credits[passenger].add(creditToAdd);
            // emit CreditAdded(passenger, creditToAdd, flightNumber, airline); // CreditedInsurances
        }
    }

    function addInsurance(
        string memory flightNumber,
        address airline,
        address passenger,
        uint256 amount
    ) external payable onlyAuthorizedCaller {
        FlightKey flightKey = _getFlightKey(flightNumber, airline);
        // require(_flights[flightKey].isRegistered, "Flight is not registered");
        require(
            _insurances[flightKey][passenger] == 0,
            "Already purchased insurance of this flight"
        );
        _insurances[flightKey][passenger] = _insurances[flightKey][passenger]
            .add(amount);
        _passengersWithInsurance[flightKey].push(passenger);
    }

    function queryPurchasedInsurance(
        string memory flightNumber,
        address airline,
        address passenger
    ) external view onlyAuthorizedCaller returns (uint256) {
        FlightKey flightKey = _getFlightKey(flightNumber, airline);
        return _insurances[flightKey][passenger];
    }

    function queryCredit(address passenger)
        external
        view
        onlyAuthorizedCaller
        returns (uint256)
    {
        return _credits[passenger];
    }

    function withdrawCredit(address passenger) external onlyAuthorizedCaller {
        uint256 credit = _credits[passenger];
        // require(credit > 0, "No credit available"); // done in App contract
        if (credit > 0) {
            delete _credits[passenger];
            payable(passenger).transfer(credit);
        }
    }

    ///

    /**
     * @dev Fallback function for funding smart contract.
     */
    fallback() external payable {}

    receive() external payable {}

    function fund() external payable {}

    function _getFlightKey(string memory flightNumber, address airline)
        internal
        pure
        returns (FlightKey)
    {
        return
            FlightKey.wrap(keccak256(abi.encodePacked(flightNumber, airline)));
    }
}
