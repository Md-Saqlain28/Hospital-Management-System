import { query } from './db/index.js';

(async () => {
  try {
    const doctor_id = 3;
    const patient_id = 3;
    const appointment_date = '2026-05-20';
    const start_time = '09:45';
    const end_time = '10:45';
    const reason = 'Allergy';

    console.log("Checking doctor...");
    const docResult = await query('SELECT * FROM Doctors WHERE doctor_id = $1', [doctor_id]);
    const doctor = docResult.rows[0];
    if (!doctor) {
        console.log("Doctor not found"); return;
    }

    console.log("Checking conflicts...");
    const conflictResult = await query(
      `SELECT * FROM Appointments 
       WHERE doctor_id = $1 
         AND appointment_date = $2 
         AND status != 'Cancelled'
         AND (
           (start_time < $4 AND end_time > $3)
         )`,
      [doctor_id, appointment_date, start_time, end_time]
    );

    console.log("Inserting...");
    const insertResult = await query(
      `INSERT INTO Appointments (patient_id, doctor_id, appointment_date, start_time, end_time, status, reason)
       VALUES ($1, $2, $3, $4, $5, 'Scheduled', $6) RETURNING *`,
      [patient_id, doctor_id, appointment_date, start_time, end_time, reason]
    );
    console.log("Success:", insertResult.rows[0]);
  } catch (err) {
    console.error("DB ERROR:", err.message);
  }
  process.exit(0);
})();
