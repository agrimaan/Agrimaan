const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { BlockchainTransaction, SmartContract, Wallet, Token } = require('../models/Blockchain');
const auth = require('../middleware/auth');
const Web3 = require('web3');
const blockchainService = require('../services/blockchain.service');
const Blockchain = require('../models/Blockchain');

// Initialize Web3 with provider (would be configured from environment variables in production)
const web3 = new Web3(process.env.BLOCKCHAIN_PROVIDER_URL || 'http://localhost:8545');

// @route   GET api/blockchain/transactions
// @desc    Get all blockchain transactions for a user
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const options = {
      status: req.query.status,
      tokenType: req.query.tokenType,
      limit: parseInt(req.query.limit) || 20,
      skip: parseInt(req.query.skip) || 0
    };
    
    const transactions = await blockchainService.getTransactionHistory(req.user.id, options);
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Wallet not found') {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/blockchain/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await BlockchainTransaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user is involved in the transaction
    if (transaction.fromAddress !== req.user.walletAddress && 
        transaction.toAddress !== req.user.walletAddress && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/blockchain/transactions
// @desc    Create a new blockchain transaction
// @access  Private
router.post(
  '/transactions',
  [
    auth,
    [
      body('toAddress', 'Recipient address is required').not().isEmpty(),
      body('amount', 'Amount must be a positive number').isFloat({ min: 0.000001 }),
      body('tokenType', 'Token type is required').isIn(['AGM', 'LAND', 'FARMHOUSE', 'OTHER'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { toAddress, amount, tokenType, metadata } = req.body;
      
      // Get user's wallet
      const wallet = await Wallet.findOne({ user: req.user.id });
      
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }
      
      // Check if wallet is active
      if (wallet.status !== 'active') {
        return res.status(400).json({ message: 'Wallet is not active' });
      }
      
      // Check balance
      const tokenBalance = wallet.balances.find(b => b.tokenType === tokenType);
      if (!tokenBalance || tokenBalance.amount < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // In a real implementation, we would interact with the blockchain here
      // For now, we'll simulate a blockchain transaction
      
      // Create transaction record
      const newTransaction = new BlockchainTransaction({
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Simulated hash
        fromAddress: wallet.address,
        toAddress,
        amount,
        tokenType,
        status: 'pending',
        metadata
      });
      
      const transaction = await newTransaction.save();
      
      // Update wallet balances (in a real implementation, this would happen after blockchain confirmation)
      // Deduct from sender
      await Wallet.findOneAndUpdate(
        { address: wallet.address, 'balances.tokenType': tokenType },
        { $inc: { 'balances.$.amount': -amount } }
      );
      
      // Add to recipient (if they have a wallet in our system)
      const recipientWallet = await Wallet.findOne({ address: toAddress });
      if (recipientWallet) {
        const hasToken = recipientWallet.balances.some(b => b.tokenType === tokenType);
        
        if (hasToken) {
          await Wallet.findOneAndUpdate(
            { address: toAddress, 'balances.tokenType': tokenType },
            { $inc: { 'balances.$.amount': amount } }
          );
        } else {
          await Wallet.findOneAndUpdate(
            { address: toAddress },
            { $push: { balances: { tokenType, amount } } }
          );
        }
      }
      
      res.json(transaction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/blockchain/transfer
// @desc    Transfer AGM tokens
// @access  Private
router.post(
  '/transfer',
  [
    auth,
    [
      body('toAddress', 'Recipient address is required').not().isEmpty(),
      body('amount', 'Amount must be a positive number').isFloat({ min: 0.000001 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { toAddress, amount } = req.body;
      
      const transaction = await blockchainService.transferTokens(
        req.user.id,
        toAddress,
        parseFloat(amount)
      );
      
      res.json(transaction);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Wallet not found' || err.message === 'Insufficient balance') {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/blockchain/contracts
// @desc    Get all smart contracts
// @access  Private/Admin
router.get('/contracts', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const contracts = await SmartContract.find().sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/blockchain/contracts/:id
// @desc    Get smart contract by ID
// @access  Private
router.get('/contracts/:id', auth, async (req, res) => {
  try {
    const contract = await SmartContract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: 'Smart contract not found' });
    }
    
    res.json(contract);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Smart contract not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/blockchain/contracts
// @desc    Deploy a new smart contract
// @access  Private/Admin
router.post(
  '/contracts',
  [
    auth,
    [
      body('contractName', 'Contract name is required').not().isEmpty(),
      body('contractType', 'Contract type is required').isIn(['token', 'marketplace', 'supply_chain', 'yield_sharing', 'land_ownership', 'other']),
      body('abi', 'Contract ABI is required').not().isEmpty(),
      body('network', 'Network is required').isIn(['mainnet', 'testnet', 'polygon', 'polygon_testnet', 'private'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { contractName, contractType, abi, bytecode, network } = req.body;
      
      // In a real implementation, we would deploy the contract to the blockchain here
      // For now, we'll simulate a contract deployment
      
      const newContract = new SmartContract({
        contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Simulated address
        contractName,
        contractType,
        abi,
        bytecode,
        network,
        owner: req.user.id,
        deploymentTransaction: `0x${Math.random().toString(16).substr(2, 64)}` // Simulated transaction hash
      });
      
      const contract = await newContract.save();
      
      res.json(contract);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/blockchain/wallet
// @desc    Get user's wallet
// @access  Private
router.get('/wallet', auth, async (req, res) => {
  try {
    const wallet = await blockchainService.getWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Wallet not found') {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/blockchain/wallet
// @desc    Create a new wallet for user
// @access  Private
router.post('/wallet', auth, async (req, res) => {
  try {
    const wallet = await blockchainService.createWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'User already has a wallet') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/blockchain/tokens
// @desc    Get all tokens owned by user
// @access  Private
router.get('/tokens', auth, async (req, res) => {
  try {
    const options = {
      tokenType: req.query.tokenType,
      status: req.query.status
    };
    
    const tokens = await blockchainService.getUserTokens(req.user.id, options);
    res.json(tokens);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/blockchain/tokens/:id
// @desc    Get token by ID
// @access  Private
router.get('/tokens/:id', auth, async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);
    
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    // Check if user is the owner or admin
    if (token.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(token);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Token not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/blockchain/tokens/land
// @desc    Create a land token
// @access  Private
router.post(
  '/tokens/land',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('location', 'Location is required').not().isEmpty(),
      body('area', 'Area must be a positive number').isFloat({ min: 0.01 }),
      body('coordinates', 'Coordinates are required').isArray()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, location, area, coordinates, propertyType, soilType, documents } = req.body;
      
      const landData = {
        name,
        description,
        location,
        area,
        coordinates,
        propertyType,
        soilType,
        documents
      };
      
      const token = await blockchainService.createLandToken(req.user.id, landData);
      res.json(token);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Wallet not found') {
        return res.status(404).json({ message: 'Wallet not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/blockchain/tokens/farmhouse
// @desc    Create a farmhouse token
// @access  Private
router.post(
  '/tokens/farmhouse',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('location', 'Location is required').not().isEmpty(),
      body('area', 'Area must be a positive number').isFloat({ min: 0.01 }),
      body('valuation', 'Valuation must be a positive number').isFloat({ min: 0.01 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, location, area, buildingType, facilities, yearBuilt, valuation, documents } = req.body;
      
      const farmhouseData = {
        name,
        description,
        location,
        area,
        buildingType,
        facilities,
        yearBuilt,
        valuation,
        documents
      };
      
      const token = await blockchainService.createFarmhouseToken(req.user.id, farmhouseData);
      res.json(token);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Wallet not found') {
        return res.status(404).json({ message: 'Wallet not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/blockchain/tokens/mint
// @desc    Mint a new token
// @access  Private/Admin
router.post(
  '/tokens/mint',
  [
    auth,
    [
      body('tokenType', 'Token type is required').isIn(['ERC20', 'ERC721', 'ERC1155']),
      body('contractAddress', 'Contract address is required').not().isEmpty(),
      body('assetType', 'Asset type is required').isIn(['land', 'farmhouse', 'equipment', 'crop_yield', 'other']),
      body('metadata', 'Metadata is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { 
        tokenType, 
        contractAddress, 
        ownerUserId, // The user who will own this token
        assetType, 
        metadata,
        assetDetails,
        value,
        fractionalOwnership,
        yieldSharing
      } = req.body;
      
      // Verify contract exists
      const contract = await SmartContract.findOne({ contractAddress });
      if (!contract) {
        return res.status(404).json({ message: 'Smart contract not found' });
      }
      
      // Verify user exists
      const tokenOwner = await User.findById(ownerUserId);
      if (!tokenOwner) {
        return res.status(404).json({ message: 'Token owner not found' });
      }
      
      // In a real implementation, we would mint the token on the blockchain here
      // For now, we'll simulate token minting
      
      const newToken = new Token({
        tokenId: `${Math.floor(Math.random() * 1000000)}`, // Simulated token ID
        tokenType,
        contractAddress,
        owner: ownerUserId,
        metadata,
        assetType,
        assetDetails: assetDetails || {},
        value: value || { amount: 0, currency: 'USD', lastValuation: new Date() },
        fractionalOwnership: fractionalOwnership || { isEnabled: false },
        yieldSharing: yieldSharing || { isEnabled: false }
      });
      
      const token = await newToken.save();
      
      res.json(token);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/blockchain/tokens/transfer
// @desc    Transfer a token to another user
// @access  Private
router.post(
  '/tokens/transfer',
  [
    auth,
    [
      body('tokenId', 'Token ID is required').not().isEmpty(),
      body('toUserId', 'Recipient user ID is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { tokenId, toUserId } = req.body;
      
      // Find the token
      const token = await Token.findOne({ tokenId });
      if (!token) {
        return res.status(404).json({ message: 'Token not found' });
      }
      
      // Check if user is the owner
      if (token.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if token is transferable
      if (token.status !== 'active') {
        return res.status(400).json({ message: 'Token is not transferable' });
      }
      
      // Verify recipient exists
      const recipient = await User.findById(toUserId);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
      
      // In a real implementation, we would transfer the token on the blockchain here
      // For now, we'll simulate token transfer
      
      // Record previous owner
      token.previousOwners.push({
        user: token.owner,
        transferDate: new Date(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Simulated transaction hash
      });
      
      // Update owner
      token.owner = toUserId;
      token.updatedAt = new Date();
      
      await token.save();
      
      res.json(token);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/blockchain/offerings
// @desc    Create a fractional token offering
// @access  Private
router.post(
  '/offerings',
  [
    auth,
    [
      body('tokenId', 'Token ID is required').not().isEmpty(),
      body('totalShares', 'Total shares must be a positive integer').isInt({ min: 1 }),
      body('pricePerShare', 'Price per share must be a positive number').isFloat({ min: 0.000001 }),
      body('minInvestment', 'Minimum investment must be a positive number').isFloat({ min: 0.000001 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { tokenId, totalShares, pricePerShare, minInvestment, maxInvestment, description, terms } = req.body;
      
      const offeringData = {
        totalShares: parseInt(totalShares),
        pricePerShare: parseFloat(pricePerShare),
        minInvestment: parseFloat(minInvestment),
        maxInvestment: maxInvestment ? parseFloat(maxInvestment) : undefined,
        description,
        terms
      };
      
      const offering = await blockchainService.createFractionalOffering(req.user.id, tokenId, offeringData);
      res.json(offering);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Token not found' || 
          err.message === 'You do not own this token' || 
          err.message === 'Token is already fractionalized') {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/blockchain/offerings
// @desc    Get all active offerings
// @access  Private
router.get('/offerings', auth, async (req, res) => {
  try {
    // Get all active offerings
    const offerings = await Blockchain.FractionalOffering.find({ status: 'active' })
      .populate('parentToken')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    
    // Format response
    const formattedOfferings = await Promise.all(offerings.map(async (offering) => {
      const totalInvestedShares = await blockchainService.getTotalInvestedShares(offering._id);
      const availableShares = offering.totalShares - totalInvestedShares;
      
      return {
        offeringId: offering.offeringId,
        parentToken: {
          tokenId: offering.parentToken.tokenId,
          tokenType: offering.parentToken.tokenType,
          metadata: offering.parentToken.metadata
        },
        creator: offering.creator,
        totalShares: offering.totalShares,
        investedShares: totalInvestedShares,
        availableShares,
        pricePerShare: offering.pricePerShare,
        minInvestment: offering.minInvestment,
        maxInvestment: offering.maxInvestment,
        description: offering.description,
        status: offering.status,
        createdAt: offering.createdAt
      };
    }));
    
    res.json(formattedOfferings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/blockchain/invest
// @desc    Invest in a fractional offering
// @access  Private
router.post(
  '/invest',
  [
    auth,
    [
      body('offeringId', 'Offering ID is required').not().isEmpty(),
      body('shares', 'Shares must be a positive integer').isInt({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { offeringId, shares } = req.body;
      
      const investment = await blockchainService.investInOffering(
        req.user.id,
        offeringId,
        parseInt(shares)
      );
      
      res.json(investment);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Wallet not found' || 
          err.message === 'Offering not found' || 
          err.message === 'Offering is not active' || 
          err.message === 'Insufficient balance' ||
          err.message.includes('shares available') ||
          err.message.includes('Minimum investment') ||
          err.message.includes('Maximum investment')) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/blockchain/investments
// @desc    Get user's investments
// @access  Private
router.get('/investments', auth, async (req, res) => {
  try {
    const investments = await blockchainService.getUserInvestments(req.user.id);
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/blockchain/market
// @desc    Get marketplace data
// @access  Private
router.get('/market', auth, async (req, res) => {
  try {
    // Get active offerings
    const offerings = await Blockchain.FractionalOffering.find({ status: 'active' })
      .populate('parentToken')
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get recent transactions
    const transactions = await Blockchain.Transaction.find({
      status: 'completed',
      'metadata.type': 'investment'
    })
      .sort({ completedAt: -1 })
      .limit(10);
    
    // Get token stats
    const landTokens = await Blockchain.Token.countDocuments({ tokenType: 'LAND' });
    const farmhouseTokens = await Blockchain.Token.countDocuments({ tokenType: 'FARMHOUSE' });
    const fractionalizedTokens = await Blockchain.Token.countDocuments({ fractionalized: true });
    
    // Get total AGM in circulation (simplified)
    const totalAGM = await Blockchain.Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    res.json({
      activeOfferings: offerings.map(offering => ({
        offeringId: offering.offeringId,
        tokenType: offering.tokenType,
        name: offering.parentToken.metadata.name,
        creator: offering.creator.name,
        pricePerShare: offering.pricePerShare,
        totalShares: offering.totalShares,
        createdAt: offering.createdAt
      })),
      recentTransactions: transactions.map(tx => ({
        txHash: tx.txHash,
        amount: tx.amount,
        tokenType: tx.tokenType,
        timestamp: tx.completedAt,
        type: tx.metadata.type,
        shares: tx.metadata.shares
      })),
      stats: {
        landTokens,
        farmhouseTokens,
        fractionalizedTokens,
        totalAGM: totalAGM.length > 0 ? totalAGM[0].total : 0
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;