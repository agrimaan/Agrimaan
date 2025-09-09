import { ethers } from 'ethers';
import Web3 from 'web3';

// Type declarations for MetaMask/ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

// AGM Token ABI (simplified for key functions)
const AGM_TOKEN_ABI = [
  // ERC20 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // AGM Token Specific Functions
  "function MAX_SUPPLY() view returns (uint256)",
  "function verifiedFarmers(address) view returns (bool)",
  "function farmerRewards(address) view returns (uint256)",
  "function stakedBalance(address) view returns (uint256)",
  "function stakingTimestamp(address) view returns (uint256)",
  "function stakingRewardRate() view returns (uint256)",
  "function minimumStakingPeriod() view returns (uint256)",
  
  // Staking Functions
  "function stakeTokens(uint256 amount)",
  "function unstakeTokens(uint256 amount)",
  "function calculateStakingReward(address staker) view returns (uint256)",
  "function claimStakingRewards()",
  "function getStakingInfo(address staker) view returns (uint256, uint256, uint256)",
  
  // Supply Chain Functions
  "function addSupplyChainItem(bytes32 itemId, string productName, uint256 quantity, uint256 harvestDate, string location, bool organic, string[] certifications)",
  "function updateSupplyChainItem(bytes32 itemId, uint8 newStatus, address newOwner)",
  "function getSupplyChainItem(bytes32 itemId) view returns (tuple(bytes32 id, address farmer, string productName, uint256 quantity, uint256 harvestDate, uint256 timestamp, string location, bool organic, string[] certifications, address currentOwner, uint8 status))",
  
  // Admin Functions
  "function verifyFarmer(address farmer)",
  "function distributeFarmerReward(address farmer, uint256 amount)",
  "function addAuthorizedTracker(address tracker)",
  
  // View Functions
  "function isFarmerVerified(address farmer) view returns (bool)",
  "function getFarmerRewards(address farmer) view returns (uint256)",
  "function getTotalStaked() view returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event FarmerVerified(address indexed farmer)",
  "event FarmerRewardDistributed(address indexed farmer, uint256 amount)",
  "event TokensStaked(address indexed staker, uint256 amount)",
  "event TokensUnstaked(address indexed staker, uint256 amount)",
  "event StakingRewardClaimed(address indexed staker, uint256 reward)",
  "event SupplyChainItemAdded(bytes32 indexed itemId, address indexed farmer)",
  "event SupplyChainItemUpdated(bytes32 indexed itemId, address indexed updater)"
];

// Network configurations
export const NETWORKS = {
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com/',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  polygonMumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    blockExplorer: 'https://mumbai.polygonscan.com/',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  bsc: {
    chainId: 56,
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    blockExplorer: 'https://bscscan.com/',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  bscTestnet: {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorer: 'https://testnet.bscscan.com/',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  localhost: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  polygon: '',
  polygonMumbai: '',
  bsc: '',
  bscTestnet: '',
  localhost: ''
};

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  chainId: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  maxSupply: string;
  userBalance: string;
}

export interface StakingInfo {
  stakedAmount: string;
  stakingTime: number;
  pendingRewards: string;
  rewardRate: number;
  minimumPeriod: number;
}

export interface SupplyChainItem {
  id: string;
  farmer: string;
  productName: string;
  quantity: number;
  harvestDate: number;
  timestamp: number;
  location: string;
  organic: boolean;
  certifications: string[];
  currentOwner: string;
  status: number;
}

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private web3: Web3 | null = null;
  private currentNetwork: string = '';
  private currentAccount: string = '';

  constructor() {
    this.initializeWeb3();
  }

  private initializeWeb3() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    }
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Connect to wallet
  async connectWallet(): Promise<WalletInfo> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      this.currentAccount = accounts[0];
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get network info
      const network = await this.provider.getNetwork();
      this.currentNetwork = this.getNetworkName(Number(network.chainId));

      // Get balance
      const balance = await this.provider.getBalance(this.currentAccount);

      return {
        address: this.currentAccount,
        balance: ethers.formatEther(balance),
        network: this.currentNetwork,
        chainId: Number(network.chainId)
      };
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  // Disconnect wallet
  disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.currentAccount = '';
    this.currentNetwork = '';
  }

  // Get network name from chain ID
  private getNetworkName(chainId: number): string {
    const network = Object.entries(NETWORKS).find(([_, config]) => config.chainId === chainId);
    return network ? network[0] : 'unknown';
  }

  // Switch network
  async switchNetwork(networkName: string): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    const network = NETWORKS[networkName as keyof typeof NETWORKS];
    if (!network) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }]
      });
      this.currentNetwork = networkName;
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await this.addNetwork(networkName);
      } else {
        throw error;
      }
    }
  }

  // Add network to MetaMask
  private async addNetwork(networkName: string): Promise<void> {
    const network = NETWORKS[networkName as keyof typeof NETWORKS];
    if (!network) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${network.chainId.toString(16)}`,
        chainName: network.name,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : [],
        nativeCurrency: network.nativeCurrency
      }]
    });
    this.currentNetwork = networkName;
  }

  // Initialize contract
  private initializeContract() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = CONTRACT_ADDRESSES[this.currentNetwork as keyof typeof CONTRACT_ADDRESSES];
    if (!contractAddress) {
      throw new Error(`Contract not deployed on ${this.currentNetwork}`);
    }

    this.contract = new ethers.Contract(contractAddress, AGM_TOKEN_ABI, this.signer);
  }

  // Get token information
  async getTokenInfo(): Promise<TokenInfo> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const [name, symbol, decimals, totalSupply, maxSupply, userBalance] = await Promise.all([
        this.contract!.name(),
        this.contract!.symbol(),
        this.contract!.decimals(),
        this.contract!.totalSupply(),
        this.contract!.MAX_SUPPLY(),
        this.contract!.balanceOf(this.currentAccount)
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        maxSupply: ethers.formatEther(maxSupply),
        userBalance: ethers.formatEther(userBalance)
      };
    } catch (error: any) {
      console.error('Error getting token info:', error);
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  // Transfer tokens
  async transferTokens(to: string, amount: string): Promise<string> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const tx = await this.contract!.transfer(to, ethers.parseEther(amount));
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      throw new Error(`Failed to transfer tokens: ${error.message}`);
    }
  }

  // Stake tokens
  async stakeTokens(amount: string): Promise<string> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const tx = await this.contract!.stakeTokens(ethers.parseEther(amount));
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      throw new Error(`Failed to stake tokens: ${error.message}`);
    }
  }

  // Unstake tokens
  async unstakeTokens(amount: string): Promise<string> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const tx = await this.contract!.unstakeTokens(ethers.parseEther(amount));
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Error unstaking tokens:', error);
      throw new Error(`Failed to unstake tokens: ${error.message}`);
    }
  }

  // Claim staking rewards
  async claimStakingRewards(): Promise<string> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const tx = await this.contract!.claimStakingRewards();
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      throw new Error(`Failed to claim rewards: ${error.message}`);
    }
  }

  // Get staking information
  async getStakingInfo(): Promise<StakingInfo> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const [stakingInfo, rewardRate, minimumPeriod] = await Promise.all([
        this.contract!.getStakingInfo(this.currentAccount),
        this.contract!.stakingRewardRate(),
        this.contract!.minimumStakingPeriod()
      ]);

      return {
        stakedAmount: ethers.formatEther(stakingInfo[0]),
        stakingTime: Number(stakingInfo[1]),
        pendingRewards: ethers.formatEther(stakingInfo[2]),
        rewardRate: Number(rewardRate),
        minimumPeriod: Number(minimumPeriod)
      };
    } catch (error: any) {
      console.error('Error getting staking info:', error);
      throw new Error(`Failed to get staking info: ${error.message}`);
    }
  }

  // Check if farmer is verified
  async isFarmerVerified(address?: string): Promise<boolean> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const farmerAddress = address || this.currentAccount;
      return await this.contract!.isFarmerVerified(farmerAddress);
    } catch (error: any) {
      console.error('Error checking farmer verification:', error);
      throw new Error(`Failed to check farmer verification: ${error.message}`);
    }
  }

  // Get farmer rewards
  async getFarmerRewards(address?: string): Promise<string> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const farmerAddress = address || this.currentAccount;
      const rewards = await this.contract!.getFarmerRewards(farmerAddress);
      return ethers.formatEther(rewards);
    } catch (error: any) {
      console.error('Error getting farmer rewards:', error);
      throw new Error(`Failed to get farmer rewards: ${error.message}`);
    }
  }

  // Add supply chain item
  async addSupplyChainItem(
    productName: string,
    quantity: number,
    harvestDate: number,
    location: string,
    organic: boolean,
    certifications: string[]
  ): Promise<string> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const itemId = ethers.keccak256(ethers.toUtf8Bytes(`${productName}-${Date.now()}-${this.currentAccount}`));
      const tx = await this.contract!.addSupplyChainItem(
        itemId,
        productName,
        quantity,
        harvestDate,
        location,
        organic,
        certifications
      );
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error('Error adding supply chain item:', error);
      throw new Error(`Failed to add supply chain item: ${error.message}`);
    }
  }

  // Get supply chain item
  async getSupplyChainItem(itemId: string): Promise<SupplyChainItem> {
    if (!this.contract) {
      this.initializeContract();
    }

    try {
      const item = await this.contract!.getSupplyChainItem(itemId);
      return {
        id: item.id,
        farmer: item.farmer,
        productName: item.productName,
        quantity: Number(item.quantity),
        harvestDate: Number(item.harvestDate),
        timestamp: Number(item.timestamp),
        location: item.location,
        organic: item.organic,
        certifications: item.certifications,
        currentOwner: item.currentOwner,
        status: Number(item.status)
      };
    } catch (error: any) {
      console.error('Error getting supply chain item:', error);
      throw new Error(`Failed to get supply chain item: ${error.message}`);
    }
  }

  // Get current account
  getCurrentAccount(): string {
    return this.currentAccount;
  }

  // Get current network
  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  // Listen to account changes
  onAccountsChanged(callback: (accounts: string[]) => void) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen to network changes
  onChainChanged(callback: (chainId: string) => void) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }
}

// Create singleton instance
export const blockchainService = new BlockchainService();

// Export constants
export { AGM_TOKEN_ABI };