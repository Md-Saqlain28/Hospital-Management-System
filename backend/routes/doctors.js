import express from 'express';
import { query } from '../db/index.js';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

const doctorSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  specialization: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  license_number: z.string().min(1),
  shift_start: z.string(),
  shift_end: z.string()
});

// POST /api/v1/doctors
router.post('/', authorize('Admin'), async (req, res, next) => {
  try {
    const data = doctorSchema.parse(req.body);
    const result = await query(
      `INSERT INTO Doctors (first_name, last_name, specialization, phone, email, license_number, shift_start, shift_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.first_name, data.last_name, data.specialization, data.phone, data.email, data.license_number, data.shift_start, data.shift_end]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

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
