import bcrypt from 'bcrypt';
import { query } from './db/index.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    const email = 'admin2@hospital.com';
    const password = 'password123'; // The plain text password
    const role = 'Admin';
    
    // Hash the password with bcrypt (cost factor 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log(`Attempting to create user: ${email} with role: ${role}`);

    // Insert into database
    const result = await query(
      `INSERT INTO Users (email, password_hash, role, is_active) 
       VALUES ($1, $2, $3, true) 
       RETURNING user_id, email, role`,
      [email, passwordHash, role]
    );

    console.log('User created successfully!');
    console.log(result.rows[0]);
    console.log(`\nYou can now log in with:\nEmail: ${email}\nPassword: ${password}`);

    process.exit(0);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation code
      console.error('Error: A user with this email already exists.');
    } else {
      console.error('An error occurred:', error);
    }
    process.exit(1);
  }
};

createAdmin();
