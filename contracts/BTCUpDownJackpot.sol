// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BTCUpDownJackpot
 * @dev Smart contract for BTC Up/Down betting with progressive jackpot
 * - Players bet UP or DOWN on BTC price every 24h
 * - 20% commission, 80% to winners
 * - Jackpot grows when BTC is flat (no movement)
 * - Anti-cheat mechanisms: 1 bet per wallet per day
 */
contract BTCUpDownJackpot is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Events
    event BetPlaced(address indexed player, bool choice, uint256 amount);
    event ResultProcessed(bool result, uint256 jackpot, uint256 timestamp);
    event JackpotUpdated(uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    // Constants
    uint256 public constant BET_AMOUNT = 0.1 ether; // 0.1 USDC equivalent
    uint256 public constant COMMISSION_RATE = 20; // 20%
    uint256 public constant BLOCKING_TIME = 1 hours; // 1h before end
    uint256 public constant BETTING_INTERVAL = 24 hours; // 24h between bets
    uint256 public constant FLAT_THRESHOLD = 1; // 1% movement threshold

    // State variables
    address public owner;
    uint256 public jackpot;
    uint256 public nextBetTime;
    bool public bettingActive;
    bool public resultProcessed;

    // Mapping for tracking bets
    mapping(address => bool) public hasBet;
    mapping(address => uint256) public totalWon;
    mapping(address => uint256) public totalBet;
    mapping(address => uint256) public betsWon;
    mapping(address => uint256) public totalBets;

    // Arrays to store bet data
    struct Bet {
        address player;
        bool choice; // true = UP, false = DOWN
        uint256 amount;
        uint256 timestamp;
        bool won;
    }
    Bet[] public bets;

    // Price data
    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }
    PriceData public initialPrice;
    PriceData public finalPrice;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier bettingActive() {
        require(bettingActive, "Betting is not active");
        require(block.timestamp < nextBetTime, "Betting period has ended");
        _;
    }

    modifier noBetsToday() {
        require(!hasBet[msg.sender], "Already placed a bet today");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextBetTime = block.timestamp + BETTING_INTERVAL;
        bettingActive = true;
        resultProcessed = false;
    }

    /**
     * @dev Place a bet on BTC price movement
     * @param choice true for UP, false for DOWN
     */
    function placeBet(bool choice) external payable bettingActive noBetsToday {
        require(msg.value == BET_AMOUNT, "Incorrect bet amount");
        
        // Record the bet
        hasBet[msg.sender] = true;
        totalBet[msg.sender] = totalBet[msg.sender].add(msg.value);
        totalBets[msg.sender] = totalBets[msg.sender].add(1);
        
        bets.push(Bet({
            player: msg.sender,
            choice: choice,
            amount: msg.value,
            timestamp: block.timestamp,
            won: false
        }));

        // Add to jackpot
        jackpot = jackpot.add(msg.value);

        emit BetPlaced(msg.sender, choice, msg.value);
    }

    /**
     * @dev Process betting result and distribute winnings
     * Can only be called by owner after betting period ends
     */
    function processResult() external onlyOwner nonReentrant {
        require(block.timestamp >= nextBetTime, "Betting period not ended");
        require(!resultProcessed, "Result already processed");

        // Determine if BTC went UP, DOWN, or FLAT
        bool result = determineResult();
        resultProcessed = true;

        if (isFlat()) {
            // FLAT: Jackpot rolls over to next round
            nextBetTime = block.timestamp + BETTING_INTERVAL;
            bettingActive = false;
            emit ResultProcessed(result, jackpot, block.timestamp);
            return;
        }

        // Distribute winnings
        distributeWinnings(result);
        
        // Reset for next round
        resetBettingRound();

        emit ResultProcessed(result, jackpot, block.timestamp);
    }

    /**
     * @dev Determine BTC price movement result
     */
    function determineResult() internal view returns (bool) {
        // Simplified logic for demo
        // In production, use Pyth Network price feeds
        return block.timestamp % 2 == 0; // Simulated result
    }

    /**
     * @dev Check if BTC movement was below threshold (FLAT)
     */
    function isFlat() internal view returns (bool) {
        // Simplified logic for demo
        // In production, use Pyth Network with proper threshold calculation
        return block.timestamp % 3 == 0; // Simulated flat condition
    }

    /**
     * @dev Distribute winnings to winners
     */
    function distributeWinnings(bool result) internal {
        uint256 winnersCount = countWinners(result);
        uint256 winningsPerWinner = jackpot.mul(80).div(100).div(winnersCount);
        
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].choice == result) {
                bets[i].won = true;
                totalWon[bets[i].player] = totalWon[bets[i].player].add(winningsPerWinner);
                betsWon[bets[i].player] = betsWon[bets[i].player].add(1);
                payable(bets[i].player).transfer(winningsPerWinner);
            }
        }

        // Commission to owner
        uint256 commission = jackpot.mul(20).div(100);
        jackpot = 0;
        payable(owner).transfer(commission);
    }

    /**
     * @dev Count number of winners
     */
    function countWinners(bool result) internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].choice == result) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Reset betting round for next day
     */
    function resetBettingRound() internal {
        // Reset player bets
        for (uint256 i = 0; i < bets.length; i++) {
            hasBet[bets[i].player] = false;
        }

        // Reset arrays and state
        delete bets;
        bettingActive = true;
        nextBetTime = block.timestamp + BETTING_INTERVAL;
        resultProcessed = false;
    }

    /**
     * @dev Emergency function to withdraw funds
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        require(!bettingActive, "Cannot withdraw during active betting");
        
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to withdraw");
        
        payable(owner).transfer(amount);
        emit FundsWithdrawn(owner, amount);
    }

    /**
     * @dev Get current betting state
     */
    function getBettingState() external view returns (
        bool _bettingActive,
        uint256 _nextBetTime,
        uint256 _timeRemaining,
        uint256 _jackpot,
        uint256 _totalBets
    ) {
        _bettingActive = bettingActive;
        _nextBetTime = nextBetTime;
        _timeRemaining = nextBetTime > block.timestamp ? 
            nextBetTime - block.timestamp : 0;
        _jackpot = jackpot;
        _totalBets = bets.length;
    }

    /**
     * @dev Get player stats
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalWon_,
        uint256 totalBet_,
        uint256 betsWon_,
        uint256 totalBets_,
        bool hasBet_
    ) {
        totalWon_ = totalWon[player];
        totalBet_ = totalBet[player];
        betsWon_ = betsWon[player];
        totalBets_ = totalBets[player];
        hasBet_ = hasBet[player];
    }

    /**
     * @dev Update initial price (called once per round)
     */
    function setInitialPrice(uint256 price) external onlyOwner {
        require(!resultProcessed, "Round already in progress");
        initialPrice = PriceData(price, block.timestamp);
    }

    /**
     * @dev Update final price (called at end of round)
     */
    function setFinalPrice(uint256 price) external onlyOwner {
        require(resultProcessed, "Round not completed");
        finalPrice = PriceData(price, block.timestamp);
    }

    /**
     * @dev Fallback function
     */
    receive() external payable {
        revert("Do not send ETH directly");
    }
}