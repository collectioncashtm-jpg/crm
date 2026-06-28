const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { Customer, EmiPlan, Topup, Moratorium } = require('../models');

// ✅ memoryStorage - Render pe disk nahi hoti, RAM mein rakho
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// ✅ Buffer se directly parse karo - no disk needed
function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const readable = Readable.from(buffer);
    readable
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// ✅ Batch insert - 109K rows ko 1000-1000 mein insert karo, timeout avoid hoga
async function batchInsert(Model, docs, batchSize = 1000) {
  let totalInserted = 0;
  let totalDupes = 0;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    try {
      const result = await Model.insertMany(batch, { ordered: false });
      totalInserted += result.length;
    } catch (err) {
      // ordered:false se duplicates skip ho jaate hain, baaki insert hote hain
      if (err.insertedDocs) totalInserted += err.insertedDocs.length;
      if (err.writeErrors) totalDupes += err.writeErrors.length;
    }
  }
  return { totalInserted, totalDupes };
}

// Upload Customer CSV
router.post('/customers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVBuffer(req.file.buffer);
    
    const customers = data.map(row => ({
      name: (row.name || row.Name || '').trim(),
      panCard: (row.pan_card || row.pan || '').trim(),
      phoneNo: (row.phone_no || row.phone || '').trim(),
      accNo: (row.acc_no || row.account_no || '').trim(),
      disbursedDate: row.disbursed_date || row.disbursedDate || null,
      disbursedAmt: parseFloat(row.disbursed_amt || row.disbursed_amount || 0) || 0,
      overdue: parseFloat(row.overdue || row.overdue_amt || 0) || 0,
      status: (row.status || 'active').toLowerCase().trim()
    })).filter(c => c.name && c.accNo);

    const { totalInserted, totalDupes } = await batchInsert(Customer, customers);

    res.json({ 
      success: true, 
      count: totalInserted,
      duplicates: totalDupes,
      message: `${totalInserted} customers imported, ${totalDupes} duplicates skipped`
    });
  } catch (error) {
    console.error('Customer upload error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload EMI CSV
router.post('/emi', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVBuffer(req.file.buffer);
    const emiPlans = data.map(row => ({
      name: (row.name || '').trim(),
      dob: row.dob || null,
      panCard: (row.pan_card || row.pan || '').trim(),
      mobile: (row.mobile || row.phone_no || '').trim(),
      address: (row.address || '').trim(),
      accNo: (row.acc_no || row.account_no || '').trim(),
      emiStartDate: row.emi_start_date || null,
      emiEndDate: row.emi_end_date || null,
      totalEmi: parseInt(row.total_emi || 0) || 0,
      totalPaidEmi: parseInt(row.total_paid_emi || 0) || 0,
      totalAmt: parseFloat(row.total_amt || 0) || 0,
      amtLeft: parseFloat(row.amt_left || 0) || 0
    })).filter(e => e.accNo);

    const { totalInserted, totalDupes } = await batchInsert(EmiPlan, emiPlans);
    res.json({ success: true, count: totalInserted, duplicates: totalDupes });
  } catch (error) {
    console.error('EMI upload error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload Top-up CSV
router.post('/topup', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVBuffer(req.file.buffer);
    const topups = data.map(row => ({
      accNo: (row.acc_no || row.account_no || '').trim(),
      topupAmount: parseFloat(row.topup_amount || 0) || 0,
      emiStartDate: row.emi_start_date || null,
      emiEndDate: row.emi_end_date || null,
      monthlyEmi: parseFloat(row.monthly_emi || 0) || 0,
      status: row.status || 'Active'
    })).filter(t => t.accNo);

    const { totalInserted, totalDupes } = await batchInsert(Topup, topups);
    res.json({ success: true, count: totalInserted, duplicates: totalDupes });
  } catch (error) {
    console.error('Topup upload error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload Moratorium CSV
router.post('/moratorium', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVBuffer(req.file.buffer);
    const moratoria = data.map(row => ({
      accNo: (row.acc_no || row.account_no || '').trim(),
      moratoriumStart: row.moratorium_start || null,
      moratoriumEnd: row.moratorium_end || null,
      interestAccrual: row.interest_accrual || 'no',
      newEmiEndDate: row.new_emi_end_date || null,
      status: row.status || 'Active'
    })).filter(m => m.accNo);

    const { totalInserted, totalDupes } = await batchInsert(Moratorium, moratoria);
    res.json({ success: true, count: totalInserted, duplicates: totalDupes });
  } catch (error) {
    console.error('Moratorium upload error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
