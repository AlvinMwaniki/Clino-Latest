const sql = require('mssql');

/**
 * Automatically logs POST, PUT, DELETE requests to AuditLogs table.
 * Must be used AFTER authenticate middleware so req.user is available.
 */
const auditLog = async (req, res, next) => {
  // Only log mutating operations
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next();
  }

  const originalJson = res.json.bind(res);
  const startTime = Date.now();

  res.json = async (data) => {
    // Only log successful operations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const auditReq = new sql.Request();
        auditReq.input('user_id', sql.Int, req.user?.user_id || null);
        auditReq.input('action', sql.VarChar(100), req.method);
        auditReq.input('table_name', sql.VarChar(50), req.baseUrl?.replace('/api/', '') || 'unknown');
        auditReq.input('record_id', sql.Int, req.params?.id || data?.id || null);
        auditReq.input('details', sql.NVarChar(sql.MAX), JSON.stringify({
          path: req.originalUrl,
          body: req.body,
          duration_ms: Date.now() - startTime
        }));
        await auditReq.query(`
          INSERT INTO AuditLogs (user_id, action, table_name, record_id, details, created_at)
          VALUES (@user_id, @action, @table_name, @record_id, @details, GETDATE())
        `);
      } catch (err) {
        // Never let audit failure break the response
        console.error('Audit log error:', err.message);
      }
    }
    return originalJson(data);
  };

  next();
};

module.exports = { auditLog };