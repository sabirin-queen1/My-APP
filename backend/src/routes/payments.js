const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// helper: get the live account document for the logged-in user
async function getAccount(req) {
  if (req.userType === 'worker') {
    return { doc: await Worker.findById(req.user._id), model: 'Worker' };
  }
  return { doc: await User.findById(req.user._id), model: 'User' };
}

// Get my wallet balance + payment history
router.get('/wallet', protect, async (req, res) => {
  try {
    const { doc, model } = await getAccount(req);
    const payments = await Payment.find({ user: req.user._id, userModel: model }).sort({ createdAt: -1 }).limit(50);
    res.json({ balance: doc.walletBalance || 0, payments });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Deposit money into my wallet ("shub lacag")
router.post('/deposit', protect, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Enter a valid amount.' });

    const { doc, model } = await getAccount(req);
    doc.walletBalance = (doc.walletBalance || 0) + amount;
    await doc.save();

    await Payment.create({
      user: req.user._id, userModel: model, userName: doc.name, userRole: req.userType,
      type: 'deposit', amount, balanceAfter: doc.walletBalance, note: 'Wallet top-up'
    });

    res.json({ balance: doc.walletBalance, message: `$${amount} added to your wallet.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Pay the 30% commission for a contract (deducted from wallet)
router.post('/commission/:contractId', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // commission = 30% of the monthly salary
    const commission = Math.round(contract.salary * (contract.commissionRate || 0.30) * 100) / 100;
    contract.commissionAmount = commission;

    const { doc, model } = await getAccount(req);

    // who is paying?
    const isFamily = req.userType === 'household';
    const isWorker = req.userType === 'worker';
    if (!isFamily && !isWorker) return res.status(403).json({ message: 'Only family or worker can pay commission.' });

    if (isFamily && contract.familyPaid) return res.status(400).json({ message: 'You have already paid the commission.' });
    if (isWorker && contract.workerPaid) return res.status(400).json({ message: 'You have already paid the commission.' });

    if ((doc.walletBalance || 0) < commission) {
      return res.status(400).json({ message: `Insufficient balance. You need $${commission} but have $${doc.walletBalance || 0}. Please top up your wallet.` });
    }

    // deduct
    doc.walletBalance -= commission;
    await doc.save();

    if (isFamily) contract.familyPaid = true;
    if (isWorker) contract.workerPaid = true;
    await contract.save();

    await Payment.create({
      user: req.user._id, userModel: model, userName: doc.name, userRole: req.userType,
      type: 'commission', amount: commission, balanceAfter: doc.walletBalance,
      contract: contract._id, note: `30% commission for contract`
    });

    // notify the other party / admin status
    if (contract.familyPaid && contract.workerPaid) {
      await Notification.create({
        recipient: contract.household, recipientModel: 'User',
        type: 'contract_confirmed', title: 'Commission Complete',
        message: 'Both parties paid the 30% commission. You can now sign the contract.',
        relatedId: contract._id, relatedModel: 'Contract'
      });
    }

    res.json({
      balance: doc.walletBalance,
      commission,
      familyPaid: contract.familyPaid,
      workerPaid: contract.workerPaid,
      bothPaid: contract.familyPaid && contract.workerPaid,
      message: `Commission of $${commission} paid successfully.`
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
