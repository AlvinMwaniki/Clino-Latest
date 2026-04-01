const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medisoft_secret_key_change_in_production';

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const request = new sql.Request();
    request.input('username', sql.VarChar(50), username);
    const result = await request.query(`SELECT * FROM Users WHERE username = @username`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = result.recordset[0];
    let passwordMatch = false;

    // Try bcrypt first (for properly hashed passwords)
    try {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    } catch (e) {
      passwordMatch = false;
    }

    // If bcrypt fails, check plain text (for legacy users not yet migrated)
    // Also auto-upgrades the password to bcrypt on successful plain-text login
    if (!passwordMatch && password === user.password_hash) {
      passwordMatch = true;

      // Auto-upgrade: hash it now so next login uses bcrypt
      try {
        const hashed = await bcrypt.hash(password, 10);
        const upgradeReq = new sql.Request();
        upgradeReq.input('user_id', sql.Int, user.user_id);
        upgradeReq.input('hashed', sql.VarChar(255), hashed);
        await upgradeReq.query(`UPDATE Users SET password_hash = @hashed WHERE user_id = @user_id`);
        console.log(`✅ Auto-upgraded password for: ${user.username}`);
      } catch (upgradeErr) {
        console.error('Password upgrade failed (non-blocking):', upgradeErr.message);
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Log to audit table (non-blocking — never fails the login)
    try {
      const auditReq = new sql.Request();
      auditReq.input('user_id', sql.Int, user.user_id);
      auditReq.input('action', sql.VarChar(100), 'LOGIN');
      auditReq.input('table_name', sql.VarChar(50), 'Users');
      auditReq.input('record_id', sql.Int, user.user_id);
      auditReq.input('details', sql.NVarChar(sql.MAX), JSON.stringify({ username: user.username, role: user.role }));
      await auditReq.query(`
        INSERT INTO AuditLogs (user_id, action, table_name, record_id, details, created_at)
        VALUES (@user_id, @action, @table_name, @record_id, @details, GETDATE())
      `);
    } catch (_) { /* Audit failure must never block login */ }

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(
      'SELECT user_id, username, role, full_name, email, phone, created_at FROM Users ORDER BY created_at DESC'
    );
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT
        (SELECT COUNT(*) FROM Doctors)                          AS doctors,
        (SELECT COUNT(*) FROM Patients)                        AS patients,
        (SELECT COUNT(*) FROM Appointments)                    AS appointments,
        (SELECT COUNT(*) FROM Patients WHERE status='Critical') AS critical,
        (SELECT COUNT(*) FROM Pharmacy)                        AS pharmacy,
        (SELECT COUNT(*) FROM LabTests)                        AS labs,
        (SELECT COUNT(*) FROM Feedback)                        AS feedbacks,
        (SELECT ISNULL(SUM(total_amount),0) FROM Billing)      AS billing
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

module.exports = { loginUser, getAllUsers, getDashboardStats };