const sql = require('mssql');

const createPrescription = async (req, res) => {
  const {
    patient_id,
    appointment_id,
    medicines, // array: [{ medicine_id, medicine_name, dosage, frequency, duration, notes }]
    general_notes
  } = req.body;

  const doctor_id = req.user.user_id; // from JWT

  const pool = await sql.connect();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const prescReq = new sql.Request(transaction);
    prescReq.input('patient_id', sql.Int, patient_id);
    prescReq.input('appointment_id', sql.Int, appointment_id || null);
    prescReq.input('doctor_id', sql.Int, doctor_id);
    prescReq.input('general_notes', sql.NVarChar(500), general_notes || null);

    const result = await prescReq.query(`
      INSERT INTO Prescriptions (patient_id, appointment_id, doctor_id, general_notes, status, created_at)
      OUTPUT INSERTED.prescription_id
      VALUES (@patient_id, @appointment_id, @doctor_id, @general_notes, 'Active', GETDATE())
    `);

    const prescription_id = result.recordset[0].prescription_id;

    // Insert each medicine line
    for (const med of medicines) {
      const medReq = new sql.Request(transaction);
      medReq.input('prescription_id', sql.Int, prescription_id);
      medReq.input('medicine_id', sql.Int, med.medicine_id || null);
      medReq.input('medicine_name', sql.VarChar(200), med.medicine_name);
      medReq.input('dosage', sql.VarChar(100), med.dosage);
      medReq.input('frequency', sql.VarChar(100), med.frequency);
      medReq.input('duration', sql.VarChar(100), med.duration);
      medReq.input('notes', sql.NVarChar(300), med.notes || null);
      await medReq.query(`
        INSERT INTO PrescriptionItems (prescription_id, medicine_id, medicine_name, dosage, frequency, duration, notes)
        VALUES (@prescription_id, @medicine_id, @medicine_name, @dosage, @frequency, @duration, @notes)
      `);
    }

    await transaction.commit();
    res.status(201).json({ message: 'Prescription created', prescription_id });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error creating prescription', error: err.message });
  }
};

const getPrescriptionsByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const request = new sql.Request();
    request.input('patientId', sql.Int, patientId);
    const result = await request.query(`
      SELECT
        p.prescription_id, p.created_at, p.status, p.general_notes,
        u.full_name AS doctor_name,
        (
          SELECT pi.medicine_name, pi.dosage, pi.frequency, pi.duration, pi.notes
          FROM PrescriptionItems pi WHERE pi.prescription_id = p.prescription_id
          FOR JSON PATH
        ) AS medicines
      FROM Prescriptions p
      JOIN Users u ON p.doctor_id = u.user_id
      WHERE p.patient_id = @patientId
      ORDER BY p.created_at DESC
    `);
    // Parse the nested JSON
    const data = result.recordset.map(r => ({
      ...r,
      medicines: r.medicines ? JSON.parse(r.medicines) : []
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: err.message });
  }
};

const getAllPrescriptions = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT
        p.prescription_id, p.created_at, p.status,
        pat.full_name AS patient_name,
        u.full_name AS doctor_name
      FROM Prescriptions p
      JOIN Patients pat ON p.patient_id = pat.patient_id
      JOIN Users u ON p.doctor_id = u.user_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: err.message });
  }
};

const dispensePrescription = async (req, res) => {
  const { id } = req.params;
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    await request.query(`UPDATE Prescriptions SET status = 'Dispensed', dispensed_at = GETDATE() WHERE prescription_id = @id`);
    res.json({ message: 'Prescription marked as dispensed' });
  } catch (err) {
    res.status(500).json({ message: 'Error dispensing prescription', error: err.message });
  }
};

module.exports = { createPrescription, getPrescriptionsByPatient, getAllPrescriptions, dispensePrescription };