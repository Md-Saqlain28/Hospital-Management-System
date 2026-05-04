import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('Connecting to NeonDB for seeding...');
    
    // 1. Create an Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminQuery = `
      INSERT INTO Users (email, password_hash, role, is_active)
      VALUES ($1, $2, 'Admin', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    const adminRes = await pool.query(adminQuery, ['admin@hospital.com', adminPassword]);
    if (adminRes.rowCount > 0) {
      console.log('✅ Admin user created: admin@hospital.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Create a Doctor
    const doctorQuery = `
      INSERT INTO Doctors (first_name, last_name, specialization, phone, email, license_number, shift_start, shift_end)
      VALUES ('John', 'Doe', 'Cardiology', '1234567890', 'dr.doe@hospital.com', 'LIC-12345', '09:00', '17:00')
      ON CONFLICT (email) DO NOTHING
      RETURNING doctor_id;
    `;
    const docRes = await pool.query(doctorQuery);
    
    if (docRes.rowCount > 0) {
      const doctorId = docRes.rows[0].doctor_id;
      // Link doctor to a user account
      const docPassword = await bcrypt.hash('doctor123', 10);
      await pool.query(`
        INSERT INTO Users (email, password_hash, role, linked_id, is_active)
        VALUES ($1, $2, 'Doctor', $3, true)
        ON CONFLICT (email) DO NOTHING;
      `, ['dr.doe@hospital.com', docPassword, doctorId]);
      console.log('✅ Doctor created: dr.doe@hospital.com / doctor123');
    } else {
      console.log('ℹ️ Doctor already exists.');
    }

    // 3. Create a Receptionist
    const recPassword = await bcrypt.hash('reception123', 10);
    const recQuery = `
      INSERT INTO Users (email, password_hash, role, is_active)
      VALUES ($1, $2, 'Receptionist', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    const recRes = await pool.query(recQuery, ['reception@hospital.com', recPassword]);
    if (recRes.rowCount > 0) {
      console.log('✅ Receptionist user created: reception@hospital.com / reception123');
    } else {
      console.log('ℹ️ Receptionist user already exists.');
    }

    // 4. Create some Rooms
    const roomQuery = `
      INSERT INTO Rooms (room_number, room_type, floor, daily_rate)
      VALUES 
        ('101', 'General', 1, 50.00),
        ('102', 'Semi-Private', 1, 100.00),
        ('201', 'Private', 2, 200.00),
        ('301', 'ICU', 3, 500.00)
      ON CONFLICT (room_number) DO NOTHING;
    `;
    const roomRes = await pool.query(roomQuery);
    if (roomRes.rowCount > 0) {
      console.log(`✅ ${roomRes.rowCount} Rooms created.`);
    } else {
      console.log('ℹ️ Rooms already exist.');
    }

    console.log('\n🎉 Seeding complete!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seed();
