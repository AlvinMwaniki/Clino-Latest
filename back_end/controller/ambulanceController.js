const sql = require('mssql');

const getAllAmbulances = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT ambulance_id, vehicle_number, driver_name, status, current_location, last_service_date
      FROM Ambulances ORDER BY ambulance_id
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching ambulances', error: err.message });
  }
};

const dispatchAmbulance = async (req, res) => {
  const { ambulance_id, patient_id, pickup_location, destination } = req.body;
  try {
    const request = new sql.Request();
    request.input('ambulance_id', sql.Int, ambulance_id);
    request.input('patient_id', sql.Int, patient_id || null);
    request.input('pickup_location', sql.NVarChar(255), pickup_location);
    request.input('destination', sql.NVarChar(255), destination || 'MediSoft Hospital');
    request.input('dispatched_by', sql.Int, req.user.user_id);

    // Mark ambulance as dispatched
    await request.query(`UPDATE Ambulances SET status = 'Dispatched' WHERE ambulance_id = @ambulance_id`);

    // Create dispatch record
    const result = await request.query(`
      INSERT INTO AmbulanceDispatches (ambulance_id, patient_id, pickup_location, destination, dispatched_by, status, dispatched_at)
      OUTPUT INSERTED.dispatch_id
      VALUES (@ambulance_id, @patient_id, @pickup_location, @destination, @dispatched_by, 'En Route', GETDATE())
    `);

    res.status(201).json({ message: 'Ambulance dispatched', dispatch_id: result.recordset[0].dispatch_id });
  } catch (err) {
    res.status(500).json({ message: 'Error dispatching ambulance', error: err.message });
  }
};

const updateAmbulanceStatus = async (req, res) => {
  const { id } = req.params;
  const { status, current_location } = req.body;
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('status', sql.VarChar(50), status);
    request.input('current_location', sql.NVarChar(255), current_location || null);
    await request.query(`
      UPDATE Ambulances SET status = @status, current_location = @current_location WHERE ambulance_id = @id
    `);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};

const requestAmbulance = async (req, res) => {
  const { pickup_location, patient_id } = req.body;
  try {
    // Find first available ambulance
    const available = await sql.query(`SELECT TOP 1 ambulance_id FROM Ambulances WHERE status = 'Available'`);
    if (!available.recordset.length) {
      return res.status(404).json({ message: 'No ambulances available right now. Please call 999.' });
    }
    const ambulance_id = available.recordset[0].ambulance_id;
    req.body = { ambulance_id, patient_id, pickup_location, destination: 'MediSoft Hospital' };
    return dispatchAmbulance(req, res);
  } catch (err) {
    res.status(500).json({ message: 'Error requesting ambulance', error: err.message });
  }
};

const getDispatchHistory = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT
        ad.dispatch_id, ad.dispatched_at, ad.status, ad.pickup_location, ad.destination,
        a.vehicle_number, a.driver_name,
        p.full_name AS patient_name,
        u.full_name AS dispatched_by_name
      FROM AmbulanceDispatches ad
      JOIN Ambulances a ON ad.ambulance_id = a.ambulance_id
      LEFT JOIN Patients p ON ad.patient_id = p.patient_id
      LEFT JOIN Users u ON ad.dispatched_by = u.user_id
      ORDER BY ad.dispatched_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dispatch history', error: err.message });
  }
};

module.exports = { getAllAmbulances, dispatchAmbulance, updateAmbulanceStatus, requestAmbulance, getDispatchHistory };