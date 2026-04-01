const sql = require('mssql');

const getAllWards = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT
        w.ward_id, w.ward_name, w.ward_type, w.total_beds,
        COUNT(b.bed_id) AS total_bed_count,
        SUM(CASE WHEN b.status = 'Occupied' THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN b.status = 'Available' THEN 1 ELSE 0 END) AS available
      FROM Wards w
      LEFT JOIN Beds b ON w.ward_id = b.ward_id
      GROUP BY w.ward_id, w.ward_name, w.ward_type, w.total_beds
      ORDER BY w.ward_name
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wards', error: err.message });
  }
};

const getWardBeds = async (req, res) => {
  const { wardId } = req.params;
  try {
    const request = new sql.Request();
    request.input('wardId', sql.Int, wardId);
    const result = await request.query(`
      SELECT
        b.bed_id, b.bed_number, b.status, b.bed_type,
        p.full_name AS patient_name, p.patient_id,
        ba.admitted_at, ba.notes
      FROM Beds b
      LEFT JOIN BedAssignments ba ON b.bed_id = ba.bed_id AND ba.discharged_at IS NULL
      LEFT JOIN Patients p ON ba.patient_id = p.patient_id
      WHERE b.ward_id = @wardId
      ORDER BY b.bed_number
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching beds', error: err.message });
  }
};

const assignBed = async (req, res) => {
  const { bed_id, patient_id, notes } = req.body;
  try {
    const request = new sql.Request();
    request.input('bed_id', sql.Int, bed_id);
    request.input('patient_id', sql.Int, patient_id);
    request.input('notes', sql.NVarChar(300), notes || null);
    request.input('assigned_by', sql.Int, req.user.user_id);

    // Mark bed as occupied
    await request.query(`UPDATE Beds SET status = 'Occupied' WHERE bed_id = @bed_id`);

    // Update patient room
    await request.query(`UPDATE Patients SET room = (SELECT bed_number FROM Beds WHERE bed_id = @bed_id) WHERE patient_id = @patient_id`);

    // Create assignment record
    const result = await request.query(`
      INSERT INTO BedAssignments (bed_id, patient_id, admitted_at, notes, assigned_by)
      OUTPUT INSERTED.assignment_id
      VALUES (@bed_id, @patient_id, GETDATE(), @notes, @assigned_by)
    `);

    res.status(201).json({ message: 'Bed assigned successfully', assignment_id: result.recordset[0].assignment_id });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning bed', error: err.message });
  }
};

const dischargeBed = async (req, res) => {
  const { assignment_id } = req.params;
  const { discharge_notes } = req.body;
  try {
    const request = new sql.Request();
    request.input('assignment_id', sql.Int, assignment_id);
    request.input('discharge_notes', sql.NVarChar(500), discharge_notes || null);

    // Get bed_id from assignment
    const assignment = await request.query(`SELECT bed_id FROM BedAssignments WHERE assignment_id = @assignment_id`);
    const bed_id = assignment.recordset[0]?.bed_id;

    await request.query(`
      UPDATE BedAssignments SET discharged_at = GETDATE(), discharge_notes = @discharge_notes
      WHERE assignment_id = @assignment_id
    `);

    if (bed_id) {
      request.input('bed_id', sql.Int, bed_id);
      await request.query(`UPDATE Beds SET status = 'Available' WHERE bed_id = @bed_id`);
    }

    res.json({ message: 'Patient discharged, bed is now available' });
  } catch (err) {
    res.status(500).json({ message: 'Error discharging patient', error: err.message });
  }
};

const getOccupancySummary = async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT
        COUNT(*) AS total_beds,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance
      FROM Beds
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching occupancy', error: err.message });
  }
};

module.exports = { getAllWards, getWardBeds, assignBed, dischargeBed, getOccupancySummary };