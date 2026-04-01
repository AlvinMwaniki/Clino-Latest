const sql = require('mssql');

const getAuditLogs = async (req, res) => {
  const { limit = 100, user_id, action, table_name } = req.query;
  try {
    const request = new sql.Request();
    request.input('limit', sql.Int, parseInt(limit));

    let where = 'WHERE 1=1';
    if (user_id) { request.input('user_id', sql.Int, user_id); where += ' AND al.user_id = @user_id'; }
    if (action) { request.input('action', sql.VarChar(100), action); where += ' AND al.action = @action'; }
    if (table_name) { request.input('table_name', sql.VarChar(50), table_name); where += ' AND al.table_name = @table_name'; }

    const result = await request.query(`
      SELECT TOP (@limit)
        al.log_id, al.action, al.table_name, al.record_id, al.details, al.created_at,
        u.full_name AS performed_by, u.role
      FROM AuditLogs al
      LEFT JOIN Users u ON al.user_id = u.user_id
      ${where}
      ORDER BY al.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching audit logs', error: err.message });
  }
};

module.exports = { getAuditLogs };