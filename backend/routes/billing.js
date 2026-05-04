import express from 'express';
import { query } from '../db/index.js';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

const billSchema = z.object({
  patient_id: z.number().int().positive(),
  appointment_id: z.number().int().positive().optional().nullable(),
  room_id: z.number().int().positive().optional().nullable(),
  items: z.array(z.object({
    description: z.string(),
    amount: z.number().min(0)
  })),
  discount: z.number().min(0).max(100).optional(),
  tax_rate: z.number().min(0).optional()
});

const calculateStayDays = async (patient_id, room_id) => {
  // In a real system, there would be admission and discharge records with timestamps.
  // We're simplifying this based on the blueprint notes.
  return 1; // Default to 1 day for simplicity in this mockup
};

// POST /api/v1/billing - Generate a final bill
router.post('/', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const data = billSchema.parse(req.body);
    const { patient_id, appointment_id, room_id, items, discount = 0, tax_rate = 0 } = data;

    let total = items.reduce((sum, item) => sum + item.amount, 0);

    if (room_id) {
      const roomResult = await query('SELECT * FROM Rooms WHERE room_id = $1', [room_id]);
      const room = roomResult.rows[0];
      if (room) {
        const days = await calculateStayDays(patient_id, room_id);
        total += Number(room.daily_rate) * days;
      }
    }

    const insertResult = await query(
      `INSERT INTO Billing (patient_id, appointment_id, room_id, total_amount, discount, tax_rate)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [patient_id, appointment_id, room_id, total, discount, tax_rate]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/billing/:id - Get bill details
router.get('/:id', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM Billing WHERE bill_id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

const paymentSchema = z.object({
  payment_method: z.enum(['Cash', 'Card', 'Insurance', 'Online']),
  amount_paid: z.number().min(0).optional() // For partial payments
});

// PATCH /api/v1/billing/:id/pay - Record payment
router.patch('/:id/pay', authorize('Admin', 'Receptionist'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_method } = paymentSchema.parse(req.body);

    const checkResult = await query('SELECT * FROM Billing WHERE bill_id = $1', [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Mark as Paid
    const result = await query(
      `UPDATE Billing SET payment_status = 'Paid', payment_method = $1 WHERE bill_id = $2 RETURNING *`,
      [payment_method, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
