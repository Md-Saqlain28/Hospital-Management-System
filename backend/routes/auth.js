import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Helper to generate tokens
const generateTokens = (user) => {
  const payload = { user_id: user.user_id, role: user.role, linked_id: user.linked_id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await query('SELECT * FROM Users WHERE email = $1 AND is_active = true', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // In a real app, store refresh token in db/redis
    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    
    // Check if user still exists and is active
    const result = await query('SELECT * FROM Users WHERE user_id = $1 AND is_active = true', [decoded.user_id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const tokens = generateTokens(user);
    res.status(200).json(tokens);
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
    next(error);
  }
});

export default router;
