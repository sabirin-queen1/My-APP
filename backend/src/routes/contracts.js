const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Create contract (household)
router.post('/', protect, async (req, res) => {
  try {
    if (req.userType !== 'household') return res.status(403).json({ message: 'Only households can create contracts' });
    const { worker, jobType, salary, startDate, endDate, contractPeriod } = req.body;

    // Check: worker already has active or pending contract
    const existingContract = await Contract.findOne({ worker, status: { $in: ['active', 'pending'] } });
    if (existingContract) {
      return res.status(400).json({ message: 'This worker already has an active contract and is not available for hire.' });
    }

    const contract = await Contract.create({
      household: req.user._id, worker, jobType, salary, startDate, endDate, contractPeriod,
      termsAndConditions: [
        'The worker agrees to perform the duties with honesty and dedication.',
        'The family agrees to provide salary on time and respect the rights of the worker.',
        'Both parties agree to give 2 weeks notice before termination.',
        'The worker agrees to maintain confidentiality of family matters.'
      ]
    });

    await Notification.create({
      recipient: worker, recipientModel: 'Worker',
      type: 'job_request', title: 'New Job Request',
      message: 'A new job request is waiting for your response.',
      relatedId: contract._id, relatedModel: 'Contract', isImportant: true
    });

    const populated = await contract.populate([{ path: 'household', select: 'name email' }, { path: 'worker', select: 'name email avatar' }]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get contracts for current user
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.userType === 'household') filter.household = req.user._id;
    else if (req.userType === 'worker') filter.worker = req.user._id;

    const contracts = await Contract.find(filter)
      .populate('household', 'name email avatar')
      .populate('worker', 'name email avatar rating')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single contract
router.get('/:id', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('household', 'name email avatar phone')
      .populate('worker', 'name email avatar rating phone');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sign contract
router.put('/:id/sign', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    const { signature } = req.body;
    if (req.userType === 'household') {
      contract.familySignature = signature;
      contract.familySigned = true;
    } else if (req.userType === 'worker') {
      contract.workerSignature = signature;
      contract.workerSigned = true;
    }

    if (contract.familySigned && contract.workerSigned) {
      contract.status = 'active';
      contract.confirmedAt = new Date();
      await Notification.create({
        recipient: contract.household, recipientModel: 'User',
        type: 'contract_confirmed', title: 'Contract Confirmed',
        message: 'Your contract has been confirmed by both parties.',
        relatedId: contract._id, relatedModel: 'Contract'
      });
    }

    await contract.save();
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel contract
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
