const sql = require('mssql');

// ── GET ALL BILLS ─────────────────────────────────────────────────────────────
const getAllBills = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT
        b.billing_id,
        b.patient_id,
        p.full_name AS patient_name,
        b.appointment_id,
        b.total_amount,
        b.nhif_covered,
        b.sha_covered,
        b.patient_owes,
        b.payment_status,
        b.payment_method,
        b.mpesa_receipt,
        b.insurance_scheme,
        b.insurance_number,
        b.notes,
        b.created_at
      FROM Billing b
      JOIN Patients p ON b.patient_id = p.patient_id
      ORDER BY b.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ message: 'Error fetching bills', error: err.message });
  }
};

// ── GET BILL BY ID ────────────────────────────────────────────────────────────
const getBillById = async (req, res) => {
  const { id } = req.params;
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    const result = await request.query(`
      SELECT
        b.*,
        p.full_name AS patient_name,
        p.contact_info,
        u.full_name AS doctor_name,
        a.appointment_date
      FROM Billing b
      JOIN Patients p ON b.patient_id = p.patient_id
      LEFT JOIN Appointments a ON b.appointment_id = a.appointment_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN Users u ON d.user_id = u.user_id
      WHERE b.billing_id = @id
    `);
    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bill', error: err.message });
  }
};

// ── CREATE BILL ───────────────────────────────────────────────────────────────
const createBill = async (req, res) => {
  const {
    patient_id,
    appointment_id,
    consultation_fee = 0,
    lab_fees = 0,
    pharmacy_fees = 0,
    other_fees = 0,
    insurance_scheme,   // 'NHIF', 'SHA', 'Private', 'Cash'
    insurance_number,
    nhif_covered = 0,
    sha_covered = 0,
    notes
  } = req.body;

  const total_amount = parseFloat(consultation_fee) + parseFloat(lab_fees) +
    parseFloat(pharmacy_fees) + parseFloat(other_fees);
  const insurance_total = parseFloat(nhif_covered) + parseFloat(sha_covered);
  const patient_owes = Math.max(0, total_amount - insurance_total);

  try {
    const request = new sql.Request();
    request.input('patient_id', sql.Int, patient_id);
    request.input('appointment_id', sql.Int, appointment_id || null);
    request.input('consultation_fee', sql.Decimal(10, 2), consultation_fee);
    request.input('lab_fees', sql.Decimal(10, 2), lab_fees);
    request.input('pharmacy_fees', sql.Decimal(10, 2), pharmacy_fees);
    request.input('other_fees', sql.Decimal(10, 2), other_fees);
    request.input('total_amount', sql.Decimal(10, 2), total_amount);
    request.input('nhif_covered', sql.Decimal(10, 2), nhif_covered);
    request.input('sha_covered', sql.Decimal(10, 2), sha_covered);
    request.input('patient_owes', sql.Decimal(10, 2), patient_owes);
    request.input('insurance_scheme', sql.VarChar(50), insurance_scheme || 'Cash');
    request.input('insurance_number', sql.VarChar(100), insurance_number || null);
    request.input('payment_status', sql.VarChar(20), 'Pending');
    request.input('notes', sql.NVarChar(500), notes || null);

    const result = await request.query(`
      INSERT INTO Billing (
        patient_id, appointment_id, consultation_fee, lab_fees, pharmacy_fees,
        other_fees, total_amount, nhif_covered, sha_covered, patient_owes,
        insurance_scheme, insurance_number, payment_status, notes, created_at
      )
      OUTPUT INSERTED.billing_id
      VALUES (
        @patient_id, @appointment_id, @consultation_fee, @lab_fees, @pharmacy_fees,
        @other_fees, @total_amount, @nhif_covered, @sha_covered, @patient_owes,
        @insurance_scheme, @insurance_number, @payment_status, @notes, GETDATE()
      )
    `);

    res.status(201).json({
      message: 'Bill created successfully',
      billing_id: result.recordset[0].billing_id,
      total_amount,
      patient_owes
    });
  } catch (err) {
    console.error('Error creating bill:', err);
    res.status(500).json({ message: 'Error creating bill', error: err.message });
  }
};

// ── UPDATE PAYMENT STATUS ─────────────────────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { payment_status, payment_method, mpesa_receipt } = req.body;

  try {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('payment_status', sql.VarChar(20), payment_status);
    request.input('payment_method', sql.VarChar(50), payment_method || null);
    request.input('mpesa_receipt', sql.VarChar(50), mpesa_receipt || null);

    await request.query(`
      UPDATE Billing
      SET payment_status = @payment_status,
          payment_method = @payment_method,
          mpesa_receipt  = @mpesa_receipt,
          paid_at        = CASE WHEN @payment_status = 'Paid' THEN GETDATE() ELSE NULL END
      WHERE billing_id = @id
    `);

    res.json({ message: 'Payment status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment', error: err.message });
  }
};

// ── GET BILLS BY PATIENT ──────────────────────────────────────────────────────
const getBillsByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const request = new sql.Request();
    request.input('patientId', sql.Int, patientId);
    const result = await request.query(`
      SELECT
        billing_id, total_amount, nhif_covered, sha_covered, patient_owes,
        payment_status, payment_method, mpesa_receipt, insurance_scheme, created_at
      FROM Billing
      WHERE patient_id = @patientId
      ORDER BY created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patient bills', error: err.message });
  }
};

// ── BILLING SUMMARY STATS ─────────────────────────────────────────────────────
const getBillingStats = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT
        COUNT(*) AS total_bills,
        SUM(total_amount) AS total_revenue,
        SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END) AS collected,
        SUM(CASE WHEN payment_status = 'Pending' THEN patient_owes ELSE 0 END) AS outstanding,
        SUM(nhif_covered + sha_covered) AS insurance_covered,
        COUNT(CASE WHEN insurance_scheme = 'NHIF' THEN 1 END) AS nhif_claims,
        COUNT(CASE WHEN insurance_scheme = 'SHA' THEN 1 END) AS sha_claims
      FROM Billing
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching billing stats', error: err.message });
  }
};

module.exports = {
  getAllBills,
  getBillById,
  createBill,
  updatePaymentStatus,
  getBillsByPatient,
  getBillingStats
};