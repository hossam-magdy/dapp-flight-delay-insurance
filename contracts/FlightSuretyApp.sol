// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./modules/Owner.sol";
import "./modules/Operational.sol";
import "./modules/AppAirlines.sol";

// TODO: link the data contract, and store only operational-data in the app contract
//       (i.e: move airlinesRegistered array to data contract, and invoke Data contract registerAirline)
// TODO: ensure using modifier "requireIsOperational" on all needed methods (state-changing only?)
contract FlightSuretyApp is Owner, Operational, AppAirlines {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
    // 0, 10, 20, 30, 40, 50; as per constants STATUS_CODE_*
    type StatusCode is uint8;

    struct Flight {
        string flightNumber;
        address airline;
        bool isRegistered;
        StatusCode statusCode;
        uint256 updatedTimestamp;
    }
    // hash(flightNumber, airline)
    type FlightKey is bytes32;
    mapping(FlightKey => Flight) private _flights;

    constructor() {}

    /**
     * @dev Register a future flight for insuring.
     */
    function registerFlight() external requireIsOperational {
        // TODO?
    }

    /**
     * @dev Called after oracle has updated flight status
     */
    function processFlightStatus(
        address airline,
        string memory flightNumber,
        uint256 timestamp,
        StatusCode statusCode
    ) internal {
        FlightKey flightKey = _getFlightKey(flightNumber, airline);

        _flights[flightKey].statusCode = statusCode;
        _flights[flightKey].updatedTimestamp = timestamp;

        // Credit passengers
        if (
            StatusCode.unwrap(_flights[flightKey].statusCode) ==
            STATUS_CODE_LATE_AIRLINE
        ) {
            for (
                uint256 i = 0;
                i < _passengersWithInsurance[flightKey].length;
                i++
            ) {
                address passenger = _passengersWithInsurance[flightKey][i];
                uint256 insurancePaid = _insurances[flightKey][passenger];
                delete _insurances[flightKey][passenger];
                uint256 creditToAdd = (insurancePaid * 3) / 2;
                _credits[passenger] += creditToAdd;
                emit CreditAdded(passenger, creditToAdd, flightNumber, airline);
            }
        }
    }

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(
        address airline,
        string memory flightNumber,
        uint256 timestamp
    ) external requireIsOperational {
        uint8 index = _getRandomIndex(msg.sender);

        StatusRequestKey key = _getStatusRequestKey(
            index,
            airline,
            flightNumber,
            timestamp
        );

        flightStatusRequests[key] = StatusRequest({
            requester: msg.sender,
            isOpen: true
        });

        emit OracleRequest(
            index,
            airline,
            flightNumber,
            timestamp,
            StatusRequestKey.unwrap(key)
        );
    }

    /********************************************************************************************/
    /*                                   INSURANCE AND PAYMENTS                                 */
    /********************************************************************************************/
    uint256 public constant MAX_FLIGHT_INSURANCE_AMOUNT_PER_PASSENGER = 1 ether;
    uint256 public constant MIN_FLIGHT_INSURANCE_AMOUNT_PER_PASSENGER = 100 wei;

    mapping(FlightKey => address[]) private _passengersWithInsurance; // paid by passengers
    mapping(FlightKey => mapping(address => uint256)) private _insurances; // paid by passengers
    mapping(address => uint256) private _credits; // credit of passengers

    event InsurancePurchase(
        address indexed passenger,
        uint256 amount,
        string flightNumber,
        address airline
    );

    event CreditAdded(
        address passenger,
        uint256 credit,
        string flightNumber,
        address airline
    );

    event CreditWithdrawal(address passenger, uint256 credit);

    modifier requirePaymentWithinAllowedInsuranceRange() {
        require(
            msg.value >= MIN_FLIGHT_INSURANCE_AMOUNT_PER_PASSENGER,
            "Insurance amount must be more than 100 wei"
        );
        require(
            msg.value <= MAX_FLIGHT_INSURANCE_AMOUNT_PER_PASSENGER,
            "Maximum insurance is 1 ether"
        );
        _;
    }

    function purchaseInsurance(string memory flightNumber, address airline)
        external
        payable
        requirePaymentWithinAllowedInsuranceRange
    {
        FlightKey flightKey = _getFlightKey(flightNumber, airline);
        // require(_flights[flightKey].isRegistered, "Flight is not registered");
        require(
            _insurances[flightKey][msg.sender] == 0,
            "Already purchased insurance of this flight"
        );
        _insurances[flightKey][msg.sender] += msg.value;
        _passengersWithInsurance[flightKey].push(msg.sender);
        emit InsurancePurchase(msg.sender, msg.value, flightNumber, airline);
    }

    function queryCredit() external view returns (uint256) {
        return _credits[msg.sender];
    }

    function queryPurchasedInsurance(
        string memory flightNumber,
        address airline
    ) external view returns (uint256) {
        FlightKey flightKey = _getFlightKey(flightNumber, airline);
        return _insurances[flightKey][msg.sender];
    }

    function withdrawCredit() external {
        uint256 credit = _credits[msg.sender];
        require(credit > 0, "No credit available");
        delete _credits[msg.sender];
        payable(msg.sender).transfer(credit);
        emit CreditWithdrawal(msg.sender, credit);
    }

    function _getFlightKey(string memory flightNumber, address airline)
        internal
        pure
        returns (FlightKey)
    {
        return
            FlightKey.wrap(keccak256(abi.encodePacked(flightNumber, airline)));
    }

    /********************************************************************************************/
    /*                                      ORACLE MANAGEMENT                                   */
    /********************************************************************************************/

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether; // 1 gwei; // https://docs.soliditylang.org/en/v0.8.11/units-and-global-variables.html#ether-units

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct StatusRequest {
        address requester; // Account that requested status
        bool isOpen; // If open, oracle responses are accepted
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // StatusRequestKey = hash(randomIndexFromRequester, airline, flightNumber, timestamp)
    type StatusRequestKey is bytes32;

    // Track all oracle responses
    mapping(StatusRequestKey => mapping(StatusCode => address[]))
        private flightStatusOracleResponses;
    mapping(StatusRequestKey => StatusRequest) private flightStatusRequests;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(
        address indexed airline,
        string flightNumber,
        uint256 indexed timestamp,
        uint8 status,
        bytes32 indexed requestKey
    );

    event OracleReport(
        address indexed airline,
        string flightNumber,
        uint256 indexed timestamp,
        uint8 status,
        bytes32 indexed requestKey
    );

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(
        uint8 index,
        address indexed airline,
        string flightNumber,
        uint256 indexed timestamp,
        bytes32 indexed requestKey
    );

    event OracleRegistered(address oracleAddress);

    // Register an oracle with the contract
    function registerOracle() external payable requireIsOperational {
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");
        uint8[3] memory indexes = _generateIndexes(msg.sender);
        oracles[msg.sender] = Oracle({isRegistered: true, indexes: indexes});
        emit OracleRegistered(msg.sender);
    }

    function getMyIndexes()
        external
        view
        requireIsOperational
        returns (uint8[3] memory)
    {
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
        string memory flightNumber,
        uint256 timestamp,
        uint8 statusCodeInt
    ) external requireIsOperational {
        require(
            (oracles[msg.sender].indexes[0] == index) ||
                (oracles[msg.sender].indexes[1] == index) ||
                (oracles[msg.sender].indexes[2] == index),
            "Index does not match oracle request"
        );

        StatusRequestKey requestKey = _getStatusRequestKey(
            index,
            airline,
            flightNumber,
            timestamp
        );
        require(
            flightStatusRequests[requestKey].isOpen,
            "Flight or timestamp do not match oracle request, or Oracle consensus was already fulfilled"
        );

        StatusCode statusCode = StatusCode.wrap(statusCodeInt);

        flightStatusOracleResponses[requestKey][statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(
            airline,
            flightNumber,
            timestamp,
            statusCodeInt,
            StatusRequestKey.unwrap(requestKey)
        );
        if (
            flightStatusOracleResponses[requestKey][statusCode].length >=
            MIN_RESPONSES
        ) {
            emit FlightStatusInfo(
                airline,
                flightNumber,
                timestamp,
                statusCodeInt,
                StatusRequestKey.unwrap(requestKey)
            );

            delete flightStatusRequests[requestKey];

            // Handle flight status as appropriate (update data, payout insurance to passengers)
            processFlightStatus(airline, flightNumber, timestamp, statusCode);
        }
    }

    function _getStatusRequestKey(
        uint8 index,
        address airline,
        string memory flightNumber,
        uint256 timestamp
    ) internal pure returns (StatusRequestKey) {
        return
            StatusRequestKey.wrap(
                keccak256(
                    abi.encodePacked(index, airline, flightNumber, timestamp)
                )
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
