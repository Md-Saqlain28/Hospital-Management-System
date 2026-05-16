import express from 'express';
import { query } from '../db/index.js';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

const appointmentSchema = z.object({
  patient_id: z.number().int().positive(),
  doctor_id: z.number().int().positive(),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  reason: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No-Show'])
});

// POST /api/v1/appointments - Book an appointment
router.post('/', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const data = appointmentSchema.parse(req.body);
    const { patient_id, doctor_id, appointment_date, start_time, end_time, reason } = data;

    // Step 1: Verify doctor exists and is active
    const docResult = await query('SELECT * FROM Doctors WHERE doctor_id = $1', [doctor_id]);
    const doctor = docResult.rows[0];

    if (!doctor || !doctor.is_active) {
      return res.status(404).json({ error: 'Doctor not found or inactive' });
    }

    // Step 2: Check requested time is within doctor's shift
    // For simplicity, string comparison on time (assuming HH:mm:ss format)
    if (start_time < doctor.shift_start || end_time > doctor.shift_end) {
      return res.status(400).json({ error: 'Outside doctor\'s working hours' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    // Step 3: Check for overlapping appointments
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

    if (conflictResult.rowCount > 0) {
      return res.status(409).json({ error: 'Doctor is not available at this time' });
    }

    // Step 4: Insert
    const insertResult = await query(
      `INSERT INTO Appointments (patient_id, doctor_id, appointment_date, start_time, end_time, status, reason)
       VALUES ($1, $2, $3, $4, $5, 'Scheduled', $6) RETURNING *`,
      [patient_id, doctor_id, appointment_date, start_time, end_time, reason]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/appointments - List appointments (filterable)
router.get('/', authorize('Admin', 'Doctor', 'Receptionist'), async (req, res, next) => {
  try {
    const { date, doctor_id, status, limit } = req.query;

    // Auto-mark past "Scheduled" appointments as "Completed"
    await query(
      `UPDATE Appointments SET status = 'Completed'
       WHERE status = 'Scheduled' AND appointment_date < CURRENT_DATE`
    );
    
    let sql = `
      SELECT a.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization
      FROM Appointments a
      LEFT JOIN Patients p ON a.patient_id = p.patient_id
      LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (date) {
      sql += ` AND a.appointment_date = $${paramIdx++}`;
      params.push(date);
    } else {
      // By default, only show today and future appointments
      sql += ` AND a.appointment_date >= CURRENT_DATE`;
    }
    
    if (doctor_id) {
      sql += ` AND a.doctor_id = $${paramIdx++}`;
      params.push(doctor_id);
    } else if (req.user.role === 'Doctor') {
      sql += ` AND a.doctor_id = $${paramIdx++}`;
      params.push(req.user.linked_id);
    }

    if (status) {
      sql += ` AND a.status = $${paramIdx++}`;
      params.push(status);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.start_time DESC';

    if (limit) {
      sql += ` LIMIT $${paramIdx++}`;
      params.push(parseInt(limit, 10));
    }

    const result = await query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/appointments/:id - Get appointment detail
router.get('/:id', authorize('Admin', 'Doctor', 'Receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM Appointments WHERE appointment_id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appt = result.rows[0];

    if (req.user.role === 'Doctor' && appt.doctor_id !== req.user.linked_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot view other doctor\'s appointment' });
    }

    res.status(200).json(appt);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/appointments/:id/status - Update status
router.patch('/:id/status', authorize('Admin', 'Doctor'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = statusSchema.parse(req.body);

    const checkResult = await query('SELECT * FROM Appointments WHERE appointment_id = $1', [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appt = checkResult.rows[0];
    if (req.user.role === 'Doctor' && appt.doctor_id !== req.user.linked_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot update other doctor\'s appointment' });
    }

    const result = await query(
      'UPDATE Appointments SET status = $1 WHERE appointment_id = $2 RETURNING *',
      [status, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/appointments/:id - Cancel appointment
router.delete('/:id', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE Appointments SET status = $1 WHERE appointment_id = $2 RETURNING *',
      ['Cancelled', id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment cancelled successfully', appointment: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
