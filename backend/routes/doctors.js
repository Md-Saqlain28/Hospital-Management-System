import express from 'express';
import { query } from '../db/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /api/v1/doctors
router.get('/', authorize('Admin', 'Receptionist', 'Doctor'), async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM Doctors ORDER BY first_name ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/doctors/:id/availability?date=YYYY-MM-DD
router.get('/:id/availability', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const docResult = await query('SELECT * FROM Doctors WHERE doctor_id = $1', [id]);
    const doctor = docResult.rows[0];

    if (!doctor || !doctor.is_active) {
      return res.status(404).json({ error: 'Doctor not found or inactive' });
    }

    // Call stored procedure or just query appointments
    // Since we're using Postgres, a similar query to the stored procedure:
    const apptsResult = await query(
      `SELECT start_time, end_time, status 
       FROM Appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'Cancelled'
       ORDER BY start_time`,
      [id, date]
    );

    res.status(200).json({
      doctor_id: doctor.doctor_id,
      shift_start: doctor.shift_start,
      shift_end: doctor.shift_end,
      date: date,
      booked_appointments: apptsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
