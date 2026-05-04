-- PostgreSQL Schema for Hospital Management System (NeonDB)

CREATE TYPE gender_enum AS ENUM('Male','Female','Other');
CREATE TYPE blood_group_enum AS ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-');
CREATE TYPE room_type_enum AS ENUM('General','Semi-Private','Private','ICU','Operation');
CREATE TYPE room_status_enum AS ENUM('Available','Occupied','Maintenance');
CREATE TYPE appointment_status_enum AS ENUM('Scheduled','Completed','Cancelled','No-Show');
CREATE TYPE payment_status_enum AS ENUM('Pending','Paid','Partially Paid','Refunded');
CREATE TYPE payment_method_enum AS ENUM('Cash','Card','Insurance','Online');
CREATE TYPE user_role_enum AS ENUM('Admin','Doctor','Receptionist');

CREATE TABLE Patients (
    patient_id      SERIAL          PRIMARY KEY,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    date_of_birth   DATE            NOT NULL,
    age             INT             NOT NULL CHECK (age > 0 AND age < 150),
    gender          gender_enum     NOT NULL,
    phone           VARCHAR(20)     NOT NULL UNIQUE,
    email           VARCHAR(150)    UNIQUE,
    address         TEXT,
    blood_group     blood_group_enum,
    emergency_contact VARCHAR(20),
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Doctors (
    doctor_id       SERIAL          PRIMARY KEY,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    specialization  VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL UNIQUE,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    license_number  VARCHAR(50)     NOT NULL UNIQUE,
    shift_start     TIME            NOT NULL,
    shift_end       TIME            NOT NULL,
    is_active       BOOLEAN         DEFAULT TRUE,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Rooms (
    room_id         SERIAL          PRIMARY KEY,
    room_number     VARCHAR(10)     NOT NULL UNIQUE,
    room_type       room_type_enum  NOT NULL,
    floor           INT             NOT NULL CHECK (floor >= 0),
    status          room_status_enum DEFAULT 'Available',
    daily_rate      DECIMAL(10,2)   NOT NULL CHECK (daily_rate >= 0),
    patient_id      INT             NULL,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE SET NULL
);

CREATE TABLE Appointments (
    appointment_id  SERIAL          PRIMARY KEY,
    patient_id      INT             NOT NULL,
    doctor_id       INT             NOT NULL,
    appointment_date DATE           NOT NULL,
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    status          appointment_status_enum DEFAULT 'Scheduled',
    reason          TEXT,
    notes           TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES Doctors(doctor_id)   ON DELETE CASCADE,

    CHECK (end_time > start_time)
);

-- Prevent double-booking a doctor for overlapping slots
CREATE UNIQUE INDEX idx_doctor_slot
    ON Appointments (doctor_id, appointment_date, start_time);

CREATE TABLE Billing (
    bill_id         SERIAL          PRIMARY KEY,
    patient_id      INT             NOT NULL,
    appointment_id  INT,
    room_id         INT,
    total_amount    DECIMAL(12,2)   NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    discount        DECIMAL(5,2)    DEFAULT 0.00 CHECK (discount >= 0 AND discount <= 100),
    tax_rate        DECIMAL(5,2)    DEFAULT 0.00,
    final_amount    DECIMAL(12,2)   GENERATED ALWAYS AS
                        (total_amount * (1 - discount/100) * (1 + tax_rate/100)) STORED,
    payment_status  payment_status_enum DEFAULT 'Pending',
    payment_method  payment_method_enum,
    billing_date    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)     REFERENCES Patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id),
    FOREIGN KEY (room_id)        REFERENCES Rooms(room_id)
);

CREATE TABLE Users (
    user_id       SERIAL          PRIMARY KEY,
    email         VARCHAR(150)    NOT NULL UNIQUE,
    password_hash VARCHAR(255)    NOT NULL,
    role          user_role_enum  NOT NULL,
    linked_id     INT,            -- doctor_id for Doctor role, NULL otherwise
    is_active     BOOLEAN         DEFAULT TRUE,
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_appt_doctor_date ON Appointments(doctor_id, appointment_date);
CREATE INDEX idx_appt_patient     ON Appointments(patient_id);
CREATE INDEX idx_billing_patient   ON Billing(patient_id);
CREATE INDEX idx_rooms_status      ON Rooms(status);

-- Triggers and Functions

-- Function to handle updated_at for Patients
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON Patients
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Trigger for Auto-mark Room as Occupied
CREATE OR REPLACE FUNCTION trg_room_auto_status_func()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.patient_id IS NOT NULL AND OLD.patient_id IS NULL THEN
        NEW.status = 'Occupied';
    ELSIF NEW.patient_id IS NULL AND OLD.patient_id IS NOT NULL THEN
        NEW.status = 'Available';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_auto_status
BEFORE UPDATE ON Rooms
FOR EACH ROW
EXECUTE PROCEDURE trg_room_auto_status_func();
