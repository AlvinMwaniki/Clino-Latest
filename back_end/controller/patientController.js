const sql = require('mssql');
const bcrypt = require('bcryptjs');

// Get total number ya patients
exports.getTotalPatientsCount = async (req, res) => {
    try {
        const result = await sql.query`SELECT COUNT(*) AS total FROM Patients`;
        res.status(200).json({ total: result.recordset[0].total });
    } catch (err) {
        console.error("Error fetching total patient count:", err);
        res.status(500).json({ error: 'Failed to fetch patient count' });
    }
};

// Get patients admitted today
exports.getTodayAdmittedPatients = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const result = await sql.query`
      SELECT COUNT(*) AS admittedToday 
      FROM patients 
      WHERE CONVERT(date, registration_date) = ${today}
    `;
        res.json({ admittedToday: result.recordset[0].admittedToday });
    } catch (err) {
        console.error('Error fetching today\'s admitted patients:', err.message);
        res.status(500).json({ error: err.message });
    }
};
// Get number of critical patients
exports.getCriticalPatientsCount = async (req, res) => {
    try {
        const result = await sql.query`
      SELECT COUNT(*) AS criticalCount 
      FROM patients 
      WHERE status = 'Critical'
    `;
        res.json({ criticalCount: result.recordset[0].criticalCount });
    } catch (err) {
        console.error('Error fetching critical patients count:', err.message);
        res.status(500).json({ error: err.message });
    }
};
// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT
                patient_id,
                full_name,
                CONVERT(date, date_of_birth) AS date_of_birth,
                gender,
                CONVERT(date, registration_date) AS admissionDate,
                status,
                diagnosis,
                room
            FROM Patients;
        `;

        // Format date fields in JavaScript
        const formattedPatients = result.recordset.map(patient => ({
            ...patient,
            date_of_birth: patient.date_of_birth?.toISOString().split('T')[0],
            admissionDate: patient.admissionDate?.toISOString().split('T')[0]
        }));

        res.status(200).json(formattedPatients);
    } catch (err) {
        console.error('Error fetching patients:', err.message);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};
// Get list of critical patients for the dashboard table
exports.getCriticalPatients = async (req, res) => {
  try {
    const result = await sql.query`
            SELECT 
                patient_id AS id, 
                full_name AS name, 
                diagnosis AS condition, 
                status 
            FROM Patients 
            WHERE status = 'Critical'
        `;
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching critical patients list:', err.message);
    res.status(500).json({ error: 'Failed to fetch critical patients' });
  }
};
exports.registerPatient = async (req, res) => {
  const {
    username, password_hash, full_name, email, phone,
    date_of_birth, gender, status, diagnosis, room, contact_info
  } = req.body;

  const pool = await sql.connect();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 1. Insert into Users Table
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(password_hash, salt);

    const userResult = await new sql.Request(transaction)
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(255), hashedPwd)
      .input('full_name', sql.VarChar(100), full_name)
      .input('role', sql.VarChar(20), 'patient')
      .input('email', sql.VarChar(100), email)
      .input('phone', sql.VarChar(20), phone)
      .query(`
          INSERT INTO Users (username, password_hash, full_name, role, email, phone, created_at)
          OUTPUT INSERTED.user_id
          VALUES (@username, @password, @full_name, @role, @email, @phone, GETDATE())
      `);

    const newUserId = userResult.recordset[0].user_id;

    // 2. Insert into Patients Table 
    // Now that you've added user_id to SSMS, this query ita work sasa!
    await new sql.Request(transaction)
      .input('user_id', sql.Int, newUserId)
      .input('full_name', sql.VarChar(100), full_name)
      .input('dob', sql.Date, date_of_birth)
      .input('gender', sql.VarChar(10), gender)
      .input('status', sql.VarChar(50), status || 'Stable')
      .input('diagnosis', sql.VarChar(255), diagnosis || 'N/A')
      .input('room', sql.VarChar(50), room || 'Unassigned')
      .input('contact', sql.VarChar(255), contact_info)
      .query(`
          INSERT INTO Patients (user_id, full_name, date_of_birth, gender, registration_date, status, diagnosis, room, contact_info)
          VALUES (@user_id, @full_name, @dob, @gender, GETDATE(), @status, @diagnosis, @room, @contact)
      `);

    await transaction.commit();
    res.status(201).json({ message: 'Patient and User created successfully!' });

  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};