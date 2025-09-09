const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting AGM Token deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
  
  // Deploy AGM Token
  console.log("\n📦 Deploying AGM Token...");
  const AGMToken = await ethers.getContractFactory("AGMToken");
  
  // Estimate gas for deployment
  const deploymentData = AGMToken.interface.encodeDeploy([]);
  const estimatedGas = await ethers.provider.estimateGas({
    data: deploymentData,
  });
  console.log("⛽ Estimated gas for deployment:", estimatedGas.toString());
  
  // Deploy the contract
  const agmToken = await AGMToken.deploy();
  await agmToken.waitForDeployment();
  
  const contractAddress = await agmToken.getAddress();
  console.log("✅ AGM Token deployed to:", contractAddress);
  
  // Get deployment transaction
  const deploymentTx = agmToken.deploymentTransaction();
  console.log("📋 Deployment transaction hash:", deploymentTx.hash);
  
  // Verify contract details
  console.log("\n🔍 Contract Details:");
  const name = await agmToken.name();
  const symbol = await agmToken.symbol();
  const decimals = await agmToken.decimals();
  const totalSupply = await agmToken.totalSupply();
  const maxSupply = await agmToken.MAX_SUPPLY();
  
  console.log("📛 Name:", name);
  console.log("🏷️  Symbol:", symbol);
  console.log("🔢 Decimals:", decimals.toString());
  console.log("💎 Total Supply:", ethers.formatEther(totalSupply), "AGM");
  console.log("🎯 Max Supply:", ethers.formatEther(maxSupply), "AGM");
  
  // Check deployer's balance
  const deployerBalance = await agmToken.balanceOf(deployer.address);
  console.log("👤 Deployer Balance:", ethers.formatEther(deployerBalance), "AGM");
  
  // Save deployment information
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: network.chainId.toString(),
    },
    contract: {
      name: "AGMToken",
      address: contractAddress,
      deployer: deployer.address,
      deploymentTx: deploymentTx.hash,
      blockNumber: deploymentTx.blockNumber,
    },
    token: {
      name: name,
      symbol: symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.formatEther(totalSupply),
      maxSupply: ethers.formatEther(maxSupply),
    },
    timestamp: new Date().toISOString(),
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}_${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);
  
  // Save ABI for frontend integration
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "AGMToken.sol", "AGMToken.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFile = path.join(deploymentsDir, `AGMToken_ABI.json`);
    fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
    console.log("📄 ABI saved to:", abiFile);
  }
  
  // Initial setup tasks
  console.log("\n⚙️  Performing initial setup...");
  
  // Set up some initial verified farmers (example addresses)
  const sampleFarmers = [
    "0x1234567890123456789012345678901234567890", // Replace with actual farmer addresses
    "0x2345678901234567890123456789012345678901",
  ];
  
  console.log("👨‍🌾 Setting up sample verified farmers...");
  for (const farmer of sampleFarmers) {
    try {
      // Only verify if the address is valid and not zero address
      if (farmer !== "0x0000000000000000000000000000000000000000") {
        const tx = await agmToken.verifyFarmer(farmer);
        await tx.wait();
        console.log("✅ Verified farmer:", farmer);
      }
    } catch (error) {
      console.log("⚠️  Could not verify farmer:", farmer, "- This is expected for example addresses");
    }
  }
  
  // Display important information for frontend integration
  console.log("\n🔗 Frontend Integration Information:");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  
  // Network-specific information
  if (network.chainId === 137n) {
    console.log("🟣 Polygon Mainnet deployment completed!");
    console.log("🔍 Verify on PolygonScan:", `https://polygonscan.com/address/${contractAddress}`);
  } else if (network.chainId === 80001n) {
    console.log("🟣 Polygon Mumbai Testnet deployment completed!");
    console.log("🔍 Verify on Mumbai PolygonScan:", `https://mumbai.polygonscan.com/address/${contractAddress}`);
  } else if (network.chainId === 56n) {
    console.log("🟡 BSC Mainnet deployment completed!");
    console.log("🔍 Verify on BscScan:", `https://bscscan.com/address/${contractAddress}`);
  } else if (network.chainId === 97n) {
    console.log("🟡 BSC Testnet deployment completed!");
    console.log("🔍 Verify on BSC Testnet:", `https://testnet.bscscan.com/address/${contractAddress}`);
  } else if (network.chainId === 1337n) {
    console.log("🏠 Local Hardhat network deployment completed!");
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  
  return {
    agmToken,
    contractAddress,
    deploymentInfo,
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;