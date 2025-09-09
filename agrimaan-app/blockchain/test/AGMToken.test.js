const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AGMToken", function () {
  let agmToken;
  let owner;
  let farmer1;
  let farmer2;
  let buyer1;
  let logistics1;
  let addrs;

  const MAX_SUPPLY = ethers.parseEther("100000000000000"); // 100 trillion tokens
  const INITIAL_SUPPLY = MAX_SUPPLY;

  beforeEach(async function () {
    // Get signers
    [owner, farmer1, farmer2, buyer1, logistics1, ...addrs] = await ethers.getSigners();

    // Deploy AGM Token
    const AGMToken = await ethers.getContractFactory("AGMToken");
    agmToken = await AGMToken.deploy();
    await agmToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await agmToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await agmToken.balanceOf(owner.address);
      expect(await agmToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct token details", async function () {
      expect(await agmToken.name()).to.equal("Agrimaan Token");
      expect(await agmToken.symbol()).to.equal("AGM");
      expect(await agmToken.decimals()).to.equal(18);
      expect(await agmToken.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await agmToken.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });
  });

  describe("Farmer Verification", function () {
    it("Should allow owner to verify farmers", async function () {
      await agmToken.verifyFarmer(farmer1.address);
      expect(await agmToken.verifiedFarmers(farmer1.address)).to.be.true;
    });

    it("Should emit FarmerVerified event", async function () {
      await expect(agmToken.verifyFarmer(farmer1.address))
        .to.emit(agmToken, "FarmerVerified")
        .withArgs(farmer1.address);
    });

    it("Should not allow non-owner to verify farmers", async function () {
      await expect(
        agmToken.connect(farmer1).verifyFarmer(farmer2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow verifying zero address", async function () {
      await expect(
        agmToken.verifyFarmer(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid farmer address");
    });
  });

  describe("Farmer Rewards", function () {
    beforeEach(async function () {
      await agmToken.verifyFarmer(farmer1.address);
    });

    it("Should allow owner to distribute rewards to verified farmers", async function () {
      const rewardAmount = ethers.parseEther("1000");
      const initialBalance = await agmToken.balanceOf(farmer1.address);

      await agmToken.distributeFarmerReward(farmer1.address, rewardAmount);

      const finalBalance = await agmToken.balanceOf(farmer1.address);
      expect(finalBalance - initialBalance).to.equal(rewardAmount);
      expect(await agmToken.farmerRewards(farmer1.address)).to.equal(rewardAmount);
    });

    it("Should emit FarmerRewardDistributed event", async function () {
      const rewardAmount = ethers.parseEther("1000");
      
      await expect(agmToken.distributeFarmerReward(farmer1.address, rewardAmount))
        .to.emit(agmToken, "FarmerRewardDistributed")
        .withArgs(farmer1.address, rewardAmount);
    });

    it("Should not allow rewards to unverified farmers", async function () {
      const rewardAmount = ethers.parseEther("1000");
      
      await expect(
        agmToken.distributeFarmerReward(farmer2.address, rewardAmount)
      ).to.be.revertedWith("Farmer not verified");
    });

    it("Should not allow zero reward amount", async function () {
      await expect(
        agmToken.distributeFarmerReward(farmer1.address, 0)
      ).to.be.revertedWith("Reward amount must be positive");
    });
  });

  describe("Staking", function () {
    const stakingAmount = ethers.parseEther("1000");

    beforeEach(async function () {
      // Transfer some tokens to farmer1 for staking
      await agmToken.transfer(farmer1.address, stakingAmount * 2n);
    });

    it("Should allow users to stake tokens", async function () {
      await agmToken.connect(farmer1).stakeTokens(stakingAmount);

      expect(await agmToken.stakedBalance(farmer1.address)).to.equal(stakingAmount);
      expect(await agmToken.getTotalStaked()).to.equal(stakingAmount);
    });

    it("Should emit TokensStaked event", async function () {
      await expect(agmToken.connect(farmer1).stakeTokens(stakingAmount))
        .to.emit(agmToken, "TokensStaked")
        .withArgs(farmer1.address, stakingAmount);
    });

    it("Should not allow staking zero tokens", async function () {
      await expect(
        agmToken.connect(farmer1).stakeTokens(0)
      ).to.be.revertedWith("Staking amount must be positive");
    });

    it("Should not allow staking more than balance", async function () {
      const excessiveAmount = ethers.parseEther("10000");
      
      await expect(
        agmToken.connect(farmer1).stakeTokens(excessiveAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should calculate staking rewards correctly", async function () {
      await agmToken.connect(farmer1).stakeTokens(stakingAmount);
      
      // Fast forward 365 days
      await time.increase(365 * 24 * 60 * 60);
      
      const expectedReward = stakingAmount * 5n / 100n; // 5% annual reward
      const actualReward = await agmToken.calculateStakingReward(farmer1.address);
      
      // Allow for small rounding differences
      expect(actualReward).to.be.closeTo(expectedReward, ethers.parseEther("1"));
    });

    it("Should allow unstaking after minimum period", async function () {
      await agmToken.connect(farmer1).stakeTokens(stakingAmount);
      
      // Fast forward past minimum staking period (30 days)
      await time.increase(31 * 24 * 60 * 60);
      
      const initialBalance = await agmToken.balanceOf(farmer1.address);
      await agmToken.connect(farmer1).unstakeTokens(stakingAmount);
      
      const finalBalance = await agmToken.balanceOf(farmer1.address);
      expect(finalBalance - initialBalance).to.be.at.least(stakingAmount);
      expect(await agmToken.stakedBalance(farmer1.address)).to.equal(0);
    });

    it("Should not allow unstaking before minimum period", async function () {
      await agmToken.connect(farmer1).stakeTokens(stakingAmount);
      
      await expect(
        agmToken.connect(farmer1).unstakeTokens(stakingAmount)
      ).to.be.revertedWith("Minimum staking period not met");
    });

    it("Should allow claiming staking rewards", async function () {
      await agmToken.connect(farmer1).stakeTokens(stakingAmount);
      
      // Fast forward 365 days
      await time.increase(365 * 24 * 60 * 60);
      
      const initialBalance = await agmToken.balanceOf(farmer1.address);
      await agmToken.connect(farmer1).claimStakingRewards();
      const finalBalance = await agmToken.balanceOf(farmer1.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Supply Chain", function () {
    const itemId = ethers.keccak256(ethers.toUtf8Bytes("item1"));
    const productName = "Organic Tomatoes";
    const quantity = 1000;
    const harvestDate = Math.floor(Date.now() / 1000);
    const location = "Farm A, Village X";
    const organic = true;
    const certifications = ["Organic", "Fair Trade"];

    beforeEach(async function () {
      await agmToken.verifyFarmer(farmer1.address);
    });

    it("Should allow verified farmers to add supply chain items", async function () {
      await agmToken.connect(farmer1).addSupplyChainItem(
        itemId,
        productName,
        quantity,
        harvestDate,
        location,
        organic,
        certifications
      );

      const item = await agmToken.getSupplyChainItem(itemId);
      expect(item.farmer).to.equal(farmer1.address);
      expect(item.productName).to.equal(productName);
      expect(item.quantity).to.equal(quantity);
      expect(item.organic).to.equal(organic);
    });

    it("Should emit SupplyChainItemAdded event", async function () {
      await expect(
        agmToken.connect(farmer1).addSupplyChainItem(
          itemId,
          productName,
          quantity,
          harvestDate,
          location,
          organic,
          certifications
        )
      ).to.emit(agmToken, "SupplyChainItemAdded")
        .withArgs(itemId, farmer1.address);
    });

    it("Should not allow unverified users to add supply chain items", async function () {
      await expect(
        agmToken.connect(farmer2).addSupplyChainItem(
          itemId,
          productName,
          quantity,
          harvestDate,
          location,
          organic,
          certifications
        )
      ).to.be.revertedWith("Not authorized to add supply chain items");
    });

    it("Should allow authorized trackers to update supply chain items", async function () {
      // Add item first
      await agmToken.connect(farmer1).addSupplyChainItem(
        itemId,
        productName,
        quantity,
        harvestDate,
        location,
        organic,
        certifications
      );

      // Add authorized tracker
      await agmToken.addAuthorizedTracker(logistics1.address);

      // Update item status
      await agmToken.connect(logistics1).updateSupplyChainItem(
        itemId,
        1, // Processing status
        buyer1.address
      );

      const item = await agmToken.getSupplyChainItem(itemId);
      expect(item.status).to.equal(1);
      expect(item.currentOwner).to.equal(buyer1.address);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause and unpause", async function () {
      await agmToken.pause();
      expect(await agmToken.paused()).to.be.true;

      await agmToken.unpause();
      expect(await agmToken.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      await agmToken.pause();

      await expect(
        agmToken.transfer(farmer1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        agmToken.connect(farmer1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update staking reward rate", async function () {
      await agmToken.updateStakingRewardRate(10);
      expect(await agmToken.stakingRewardRate()).to.equal(10);
    });

    it("Should not allow reward rate above 20%", async function () {
      await expect(
        agmToken.updateStakingRewardRate(25)
      ).to.be.revertedWith("Reward rate too high");
    });

    it("Should allow owner to update minimum staking period", async function () {
      const newPeriod = 60 * 24 * 60 * 60; // 60 days
      await agmToken.updateMinimumStakingPeriod(newPeriod);
      expect(await agmToken.minimumStakingPeriod()).to.equal(newPeriod);
    });

    it("Should not allow staking period less than 1 day", async function () {
      const shortPeriod = 12 * 60 * 60; // 12 hours
      await expect(
        agmToken.updateMinimumStakingPeriod(shortPeriod)
      ).to.be.revertedWith("Period too short");
    });

    it("Should allow emergency withdraw", async function () {
      // First, stake some tokens to create contract balance
      const stakingAmount = ethers.parseEther("1000");
      await agmToken.transfer(farmer1.address, stakingAmount);
      await agmToken.connect(farmer1).stakeTokens(stakingAmount);

      const contractBalance = await agmToken.balanceOf(await agmToken.getAddress());
      const ownerInitialBalance = await agmToken.balanceOf(owner.address);

      await agmToken.emergencyWithdraw(contractBalance);

      const ownerFinalBalance = await agmToken.balanceOf(owner.address);
      expect(ownerFinalBalance - ownerInitialBalance).to.equal(contractBalance);
    });
  });

  describe("View Functions", function () {
    it("Should return correct staking info", async function () {
      const stakingAmount = ethers.parseEther("1000");
      await agmToken.transfer(farmer1.address, stakingAmount);
      await agmToken.connect(farmer1).stakeTokens(stakingAmount);

      const [stakedAmount, stakingTime, pendingRewards] = await agmToken.getStakingInfo(farmer1.address);
      
      expect(stakedAmount).to.equal(stakingAmount);
      expect(stakingTime).to.be.gt(0);
      expect(pendingRewards).to.equal(0); // No time passed yet
    });

    it("Should return farmer verification status", async function () {
      expect(await agmToken.isFarmerVerified(farmer1.address)).to.be.false;
      
      await agmToken.verifyFarmer(farmer1.address);
      expect(await agmToken.isFarmerVerified(farmer1.address)).to.be.true;
    });

    it("Should return farmer rewards", async function () {
      await agmToken.verifyFarmer(farmer1.address);
      
      expect(await agmToken.getFarmerRewards(farmer1.address)).to.equal(0);
      
      const rewardAmount = ethers.parseEther("500");
      await agmToken.distributeFarmerReward(farmer1.address, rewardAmount);
      
      expect(await agmToken.getFarmerRewards(farmer1.address)).to.equal(rewardAmount);
    });
  });

  describe("Token Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const burnAmount = ethers.parseEther("1000");
      const initialSupply = await agmToken.totalSupply();
      
      await agmToken.burn(burnAmount);
      
      const finalSupply = await agmToken.totalSupply();
      expect(initialSupply - finalSupply).to.equal(burnAmount);
    });

    it("Should not allow burning more than balance", async function () {
      const excessiveAmount = ethers.parseEther("200000000000000"); // More than max supply
      
      await expect(
        agmToken.burn(excessiveAmount)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });
});