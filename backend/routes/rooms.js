import express from 'express';
import { query } from '../db/index.js';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /api/v1/rooms - List rooms with status
router.get('/', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM Rooms ORDER BY room_number ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

const admitSchema = z.object({
  patient_id: z.number().int().positive()
});

// POST /api/v1/rooms/:id/admit - Admit patient to room
router.post('/:id/admit', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { patient_id } = admitSchema.parse(req.body);

    const roomResult = await query('SELECT * FROM Rooms WHERE room_id = $1', [id]);
    const room = roomResult.rows[0];

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status !== 'Available') {
      return res.status(409).json({ error: 'Room is not available' });
    }

    // Update room with patient_id. Trigger will handle setting status to 'Occupied'
    const updateResult = await query(
      'UPDATE Rooms SET patient_id = $1 WHERE room_id = $2 RETURNING *',
      [patient_id, id]
    );

    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rooms/:id/discharge - Discharge patient
router.post('/:id/discharge', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const roomResult = await query('SELECT * FROM Rooms WHERE room_id = $1', [id]);
    const room = roomResult.rows[0];

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.patient_id) {
      return res.status(400).json({ error: 'No patient in this room' });
    }

    // Set patient_id to NULL. Trigger will handle setting status to 'Available'
    const updateResult = await query(
      'UPDATE Rooms SET patient_id = NULL WHERE room_id = $1 RETURNING *',
      [id]
    );

    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/rooms/:id - Update room info
router.patch('/:id', authorize('Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    // Basic dynamic update similar to patient update can be implemented here.
    // Assuming we can update status, daily_rate, room_type
    const schema = z.object({
      status: z.enum(['Available', 'Occupied', 'Maintenance']).optional(),
      daily_rate: z.number().min(0).optional(),
      room_type: z.enum(['General', 'Semi-Private', 'Private', 'ICU', 'Operation']).optional()
    });

    const data = schema.parse(req.body);
    
    const updates = [];
    const values = [];
    let paramIdx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIdx}`);
        values.push(value);
        paramIdx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const sql = `UPDATE Rooms SET ${updates.join(', ')} WHERE room_id = $${paramIdx} RETURNING *`;
    
    const result = await query(sql, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
