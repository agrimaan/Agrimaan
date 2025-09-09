// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AGMToken
 * @dev AGM (Agrimaan) Token - ERC20 token for the Agrimaan agricultural ecosystem
 * 
 * Features:
 * - Total supply: 100 trillion tokens (100,000,000,000,000)
 * - 18 decimal places
 * - Burnable tokens
 * - Pausable transfers (for emergency situations)
 * - Owner-controlled minting (if needed for ecosystem rewards)
 * - Supply chain integration capabilities
 * - Farmer reward mechanisms
 * - Staking capabilities for governance
 */
contract AGMToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Maximum total supply: 100 trillion tokens
    uint256 public constant MAX_SUPPLY = 100_000_000_000_000 * 10**18;
    
    // Mapping for staking
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => uint256) public stakingRewards;
    
    // Mapping for farmer verification
    mapping(address => bool) public verifiedFarmers;
    mapping(address => uint256) public farmerRewards;
    
    // Supply chain tracking
    mapping(bytes32 => SupplyChainItem) public supplyChain;
    mapping(address => bool) public authorizedTrackers;
    
    // Events
    event FarmerVerified(address indexed farmer);
    event FarmerRewardDistributed(address indexed farmer, uint256 amount);
    event TokensStaked(address indexed staker, uint256 amount);
    event TokensUnstaked(address indexed staker, uint256 amount);
    event StakingRewardClaimed(address indexed staker, uint256 reward);
    event SupplyChainItemAdded(bytes32 indexed itemId, address indexed farmer);
    event SupplyChainItemUpdated(bytes32 indexed itemId, address indexed updater);
    
    struct SupplyChainItem {
        bytes32 id;
        address farmer;
        string productName;
        uint256 quantity;
        uint256 harvestDate;
        uint256 timestamp;
        string location;
        bool organic;
        string[] certifications;
        address currentOwner;
        ItemStatus status;
    }
    
    enum ItemStatus {
        Harvested,
        Processing,
        InTransit,
        Delivered,
        Sold
    }
    
    // Staking parameters
    uint256 public stakingRewardRate = 5; // 5% annual reward
    uint256 public minimumStakingPeriod = 30 days;
    
    constructor() ERC20("Agrimaan Token", "AGM") Ownable(msg.sender) {
        // Mint initial supply to contract deployer
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    /**
     * @dev Verify a farmer address for special rewards and privileges
     * @param farmer Address of the farmer to verify
     */
    function verifyFarmer(address farmer) external onlyOwner {
        require(farmer != address(0), "Invalid farmer address");
        verifiedFarmers[farmer] = true;
        emit FarmerVerified(farmer);
    }
    
    /**
     * @dev Distribute rewards to verified farmers
     * @param farmer Address of the farmer
     * @param amount Amount of tokens to reward
     */
    function distributeFarmerReward(address farmer, uint256 amount) external onlyOwner {
        require(verifiedFarmers[farmer], "Farmer not verified");
        require(amount > 0, "Reward amount must be positive");
        
        farmerRewards[farmer] += amount;
        _transfer(owner(), farmer, amount);
        
        emit FarmerRewardDistributed(farmer, amount);
    }
    
    /**
     * @dev Stake tokens for governance and rewards
     * @param amount Amount of tokens to stake
     */
    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Staking amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // If user already has staked tokens, claim rewards first
        if (stakedBalance[msg.sender] > 0) {
            claimStakingRewards();
        }
        
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     * @param amount Amount of tokens to unstake
     */
    function unstakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Unstaking amount must be positive");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(
            block.timestamp >= stakingTimestamp[msg.sender] + minimumStakingPeriod,
            "Minimum staking period not met"
        );
        
        // Claim rewards before unstaking
        claimStakingRewards();
        
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    /**
     * @dev Calculate staking rewards for an address
     * @param staker Address of the staker
     * @return reward amount
     */
    function calculateStakingReward(address staker) public view returns (uint256) {
        if (stakedBalance[staker] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakingTimestamp[staker];
        uint256 annualReward = (stakedBalance[staker] * stakingRewardRate) / 100;
        uint256 reward = (annualReward * stakingDuration) / 365 days;
        
        return reward;
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() public nonReentrant {
        uint256 reward = calculateStakingReward(msg.sender);
        require(reward > 0, "No rewards to claim");
        
        stakingRewards[msg.sender] += reward;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        // Mint new tokens as rewards (within max supply limit)
        if (totalSupply() + reward <= MAX_SUPPLY) {
            _mint(msg.sender, reward);
        }
        
        emit StakingRewardClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Add authorized tracker for supply chain
     * @param tracker Address to authorize
     */
    function addAuthorizedTracker(address tracker) external onlyOwner {
        authorizedTrackers[tracker] = true;
    }
    
    /**
     * @dev Remove authorized tracker
     * @param tracker Address to remove authorization
     */
    function removeAuthorizedTracker(address tracker) external onlyOwner {
        authorizedTrackers[tracker] = false;
    }
    
    /**
     * @dev Add item to supply chain
     * @param itemId Unique identifier for the item
     * @param productName Name of the product
     * @param quantity Quantity of the product
     * @param harvestDate Date of harvest
     * @param location Location of harvest
     * @param organic Whether the product is organic
     * @param certifications Array of certification strings
     */
    function addSupplyChainItem(
        bytes32 itemId,
        string memory productName,
        uint256 quantity,
        uint256 harvestDate,
        string memory location,
        bool organic,
        string[] memory certifications
    ) external {
        require(
            verifiedFarmers[msg.sender] || authorizedTrackers[msg.sender],
            "Not authorized to add supply chain items"
        );
        require(supplyChain[itemId].timestamp == 0, "Item already exists");
        
        supplyChain[itemId] = SupplyChainItem({
            id: itemId,
            farmer: msg.sender,
            productName: productName,
            quantity: quantity,
            harvestDate: harvestDate,
            timestamp: block.timestamp,
            location: location,
            organic: organic,
            certifications: certifications,
            currentOwner: msg.sender,
            status: ItemStatus.Harvested
        });
        
        emit SupplyChainItemAdded(itemId, msg.sender);
    }
    
    /**
     * @dev Update supply chain item status
     * @param itemId Item identifier
     * @param newStatus New status of the item
     * @param newOwner New owner of the item
     */
    function updateSupplyChainItem(
        bytes32 itemId,
        ItemStatus newStatus,
        address newOwner
    ) external {
        require(
            authorizedTrackers[msg.sender] || 
            supplyChain[itemId].currentOwner == msg.sender,
            "Not authorized to update this item"
        );
        require(supplyChain[itemId].timestamp != 0, "Item does not exist");
        
        supplyChain[itemId].status = newStatus;
        if (newOwner != address(0)) {
            supplyChain[itemId].currentOwner = newOwner;
        }
        
        emit SupplyChainItemUpdated(itemId, msg.sender);
    }
    
    /**
     * @dev Get supply chain item details
     * @param itemId Item identifier
     * @return SupplyChainItem struct
     */
    function getSupplyChainItem(bytes32 itemId) external view returns (SupplyChainItem memory) {
        return supplyChain[itemId];
    }
    
    /**
     * @dev Pause token transfers (emergency function)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Update staking reward rate
     * @param newRate New reward rate (percentage)
     */
    function updateStakingRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 20, "Reward rate too high"); // Max 20%
        stakingRewardRate = newRate;
    }
    
    /**
     * @dev Update minimum staking period
     * @param newPeriod New minimum staking period in seconds
     */
    function updateMinimumStakingPeriod(uint256 newPeriod) external onlyOwner {
        require(newPeriod >= 1 days, "Period too short");
        minimumStakingPeriod = newPeriod;
    }
    
    /**
     * @dev Emergency withdraw function for contract owner
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= balanceOf(address(this)), "Insufficient contract balance");
        _transfer(address(this), owner(), amount);
    }
    
    // Override required by Solidity for multiple inheritance
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, amount);
    }
    
    /**
     * @dev Get total staked tokens across all users
     * @return Total staked amount
     */
    function getTotalStaked() external view returns (uint256) {
        return balanceOf(address(this));
    }
    
    /**
     * @dev Check if an address is a verified farmer
     * @param farmer Address to check
     * @return Boolean indicating verification status
     */
    function isFarmerVerified(address farmer) external view returns (bool) {
        return verifiedFarmers[farmer];
    }
    
    /**
     * @dev Get farmer's total rewards earned
     * @param farmer Address of the farmer
     * @return Total rewards amount
     */
    function getFarmerRewards(address farmer) external view returns (uint256) {
        return farmerRewards[farmer];
    }
    
    /**
     * @dev Get staking information for an address
     * @param staker Address of the staker
     * @return stakedAmount The amount staked
     * @return stakingTime The timestamp when staking started
     * @return pendingRewards The pending rewards amount
     */
    function getStakingInfo(address staker) external view returns (
        uint256 stakedAmount,
        uint256 stakingTime,
        uint256 pendingRewards
    ) {
        return (
            stakedBalance[staker],
            stakingTimestamp[staker],
            calculateStakingReward(staker)
        );
    }
}