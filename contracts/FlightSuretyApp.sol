// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./modules/Owner.sol";
import "./modules/Operational.sol";
import "./modules/AppAirlines.sol";

contract FlightSuretyApp is Owner, Operational, AppAirlines {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Flight {
        bool isRegistered;
        FlightStatusCode statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(FlightKey => Flight) private flights;

    // FlightKey = hash(index, flight, timestamp)
    type FlightKey is bytes32;

    // 0, 10, 20, 30, 40; as per constants STATUS_CODE_*
    type FlightStatusCode is uint8;

    constructor() {}

    /**
     * @dev Register a future flight for insuring.
     */
    function registerFlight() external pure {
        // TODO?
    }

    /**
     * @dev Called after oracle has updated flight status
     */
    function processFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp,
        FlightStatusCode statusCode
    ) internal pure {
        // TODO?
    }

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp
    ) external {
        uint8 index = _getRandomIndex(msg.sender);

        FlightKey key = _getFlightKey(index, airline, flight, timestamp);

        flightStatusRequests[key] = FlightStatusRequest({
            requester: msg.sender,
            isOpen: true
        });

        emit OracleRequest(index, airline, flight, timestamp);
    }

    /********************************************************************************************/
    /*                                      ORACLE MANAGEMENT                                   */
    /********************************************************************************************/

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 gwei; // 1 ether; // https://docs.soliditylang.org/en/v0.8.11/units-and-global-variables.html#ether-units

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct FlightStatusRequest {
        address requester; // Account that requested status
        bool isOpen; // If open, oracle responses are accepted
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // Track all oracle responses
    mapping(FlightKey => mapping(FlightStatusCode => address[]))
        private flightStatusOracleResponses;
    mapping(FlightKey => FlightStatusRequest) private flightStatusRequests;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status
    );

    event OracleReport(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status
    );

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(
        uint8 index,
        address airline,
        string flight,
        uint256 timestamp
    );

    event OracleRegistered(address oracleAddress);

    // Register an oracle with the contract
    function registerOracle() external payable {
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");
        uint8[3] memory indexes = _generateIndexes(msg.sender);
        oracles[msg.sender] = Oracle({isRegistered: true, indexes: indexes});
        emit OracleRegistered(msg.sender);
    }

    function getMyIndexes() external view returns (uint8[3] memory) {
        require(
            oracles[msg.sender].isRegistered,
            "Not registered as an oracle"
        );
        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(
        uint8 index,
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCodeInt
    ) external {
        require(
            (oracles[msg.sender].indexes[0] == index) ||
                (oracles[msg.sender].indexes[1] == index) ||
                (oracles[msg.sender].indexes[2] == index),
            "Index does not match oracle request"
        );

        FlightKey key = _getFlightKey(index, airline, flight, timestamp);
        require(
            flightStatusRequests[key].isOpen,
            "Flight or timestamp do not match oracle request"
        );

        FlightStatusCode statusCode = FlightStatusCode.wrap(statusCodeInt);

        flightStatusOracleResponses[key][statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCodeInt);
        if (
            flightStatusOracleResponses[key][statusCode].length >= MIN_RESPONSES
        ) {
            emit FlightStatusInfo(airline, flight, timestamp, statusCodeInt);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

    function _getFlightKey(
        uint8 index,
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (FlightKey) {
        return
            FlightKey.wrap(
                keccak256(abi.encodePacked(index, airline, flight, timestamp))
            );
    }

    // Returns array of three non-duplicating integers from 0-9
    function _generateIndexes(address account)
        internal
        returns (uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = _getRandomIndex(account);

        indexes[1] = indexes[0];
        while (indexes[1] == indexes[0]) {
            indexes[1] = _getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while ((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = _getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function _getRandomIndex(address account) internal returns (uint8) {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        // used to throw VM exceptions in blockhash(block.number - nonce)
                        blockhash(block.number - 1),
                        nonce++,
                        account
                    )
                )
            ) % maxValue
        );

        if (nonce > 250) {
            nonce = 0; // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }
}
