const sql = require('mssql');
const bcrypt = require('bcryptjs');
// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT 
                d.doctor_id,
                u.full_name,
                u.email,
                u.phone,
                d.specialization,
                d.availability_schedule,
                d.feedback_score
            FROM Doctors d
            JOIN Users u ON d.user_id = u.user_id
        `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ message: 'Error fetching doctors', error: err.message });
    }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        
        const doctorResult = await request.query(`
            SELECT 
                d.doctor_id,
                u.full_name,
                u.email,
                u.phone,
                d.specialization,
                d.availability_schedule,
                d.feedback_score
            FROM Doctors d
            JOIN Users u ON d.user_id = u.user_id
            WHERE d.doctor_id = @id
        `);
        
        if (doctorResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const reviewsResult = await request.query(`
            SELECT 
                f.feedback_id,
                p.full_name as patient_name,
                f.comments,
                f.submitted_date,
                f.rating
            FROM Feedback f
            JOIN Appointments a ON f.appointment_id = a.appointment_id
            JOIN Patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = @id
            ORDER BY f.submitted_date DESC
        `);

        const doctor = doctorResult.recordset[0];
        doctor.reviews = reviewsResult.recordset;
        
        res.json(doctor);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ message: 'Error fetching doctor details', error: err.message });
    }
};

// Get doctor availability
const getDoctorAvailability = async (req, res) => {
    const { id } = req.params;
    
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        
        const result = await request.query(`
            SELECT availability_schedule
            FROM Doctors
            WHERE doctor_id = @id
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json(result.recordset[0].availability_schedule);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ message: 'Error fetching doctor availability', error: err.message });
    }
};

const getTotalDoctorsCount = async (req, res) => {
  try {
    const result = await sql.query`SELECT COUNT(*) AS total FROM Doctors`;
    res.status(200).json({ total: result.recordset[0].total });
  } catch (err) {
    console.error('Error fetching total doctor count:', err);
    res.status(500).json({ error: 'Failed to fetch doctor count' });
  }
};

// Add doctor registration (Double Insert)
const registerDoctor = async (req, res) => {
  // These ina match your form names and SSMS columns
  const {
    username,
    password_hash, // This is the raw password from the frontend form
    full_name,
    email,
    phone,
    role,
    specialization,
    availability_schedule,
    feedback_score
  } = req.body;

  try {
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      // 1. Hash the password so the doctor can log in later
      const salt = await bcrypt.genSalt(10);
      const hashedPwd = await bcrypt.hash(password_hash, salt);

      // 2. Insert into Users Table
      const userRequest = new sql.Request(transaction);
      userRequest.input('username', sql.VarChar(50), username);
      userRequest.input('password', sql.VarChar(255), hashedPwd);
      userRequest.input('full_name', sql.VarChar(100), full_name);
      userRequest.input('role', sql.VarChar(20), role || 'doctor');
      userRequest.input('email', sql.VarChar(100), email);
      userRequest.input('phone', sql.VarChar(20), phone);

      const userResult = await userRequest.query(`
                INSERT INTO Users (username, password_hash, full_name, role, email, phone, created_at)
                OUTPUT INSERTED.user_id
                VALUES (@username, @password, @full_name, @role, @email, @phone, GETDATE())
            `);

      const newUserId = userResult.recordset[0].user_id;

      // 3. Insert kwa Doctors Table
      const doctorRequest = new sql.Request(transaction);
      doctorRequest.input('user_id', sql.Int, newUserId);
      doctorRequest.input('specialization', sql.VarChar(100), specialization);
      doctorRequest.input('availability', sql.VarChar(255), availability_schedule);
      doctorRequest.input('feedback', sql.Decimal(3, 2), feedback_score || 0);

      await doctorRequest.query(`
                INSERT INTO Doctors (user_id, specialization, availability_schedule, feedback_score)
                VALUES (@user_id, @specialization, @availability, @feedback)
            `);

      await transaction.commit();
      res.status(201).json({ message: 'Doctor and User account created successfully!' });

    } catch (err) {
      await transaction.rollback();
      throw err; // Send to outer catch
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};
module.exports = {
    getAllDoctors,
    getDoctorById,
    getDoctorAvailability,
  getTotalDoctorsCount,
  registerDoctor,
};