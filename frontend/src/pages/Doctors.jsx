import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import './Shared.css';

// Helper: convert 24h "HH:mm" to { hour, minute, period }
const to12h = (time24) => {
  if (!time24) return { hour: '12', minute: '00', period: 'AM' };
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { hour: String(h), minute: mStr || '00', period };
};

// Helper: convert { hour, minute, period } back to 24h "HH:mm"
const to24h = (hour, minute, period) => {
  let h = parseInt(hour, 10);
  if (period === 'AM' && h === 12) h = 0;
  else if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${minute}`;
};

// Helper: format a 24h time string to 12h display
const formatTime12h = (time24) => {
  if (!time24) return '';
  const { hour, minute, period } = to12h(time24);
  return `${hour}:${minute} ${period}`;
};

// Reusable time picker component with AM/PM
const TimePicker = ({ value, onChange, label, required }) => {
  const parsed = to12h(value);

  const handlePart = (part, val) => {
    const next = { ...parsed, [part]: val };
    onChange(to24h(next.hour, next.minute, next.period));
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <select
          value={parsed.hour}
          onChange={(e) => handlePart('hour', e.target.value)}
          required={required}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.9rem' }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={String(h)}>{String(h).padStart(2, '0')}</option>
          ))}
        </select>
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>:</span>
        <select
          value={parsed.minute}
          onChange={(e) => handlePart('minute', e.target.value)}
          required={required}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.9rem' }}
        >
          {['00', '15', '30', '45'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={parsed.period}
          onChange={(e) => handlePart('period', e.target.value)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.9rem', fontWeight: 600 }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    patient_id: '',
    appointment_date: '',
    start_time: '09:00',
    end_time: '10:00',
    reason: ''
  });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    phone: '',
    email: '',
    license_number: '',
    shift_start: '09:00',
    shift_end: '17:00'
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors');
      setDoctors(res || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (e) => {
    setScheduleData({ ...scheduleData, [e.target.name]: e.target.value });
  };

  const openScheduleModal = (doctor) => {
    setSelectedDoctor(doctor);
    setScheduleData({
      patient_id: '',
      appointment_date: '',
      start_time: '09:00',
      end_time: '10:00',
      reason: ''
    });
    setIsScheduleModalOpen(true);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...scheduleData,
        patient_id: parseInt(scheduleData.patient_id, 10),
        doctor_id: selectedDoctor.doctor_id
      };
      await api.post('/appointments', payload);
      setIsScheduleModalOpen(false);
      alert('Appointment scheduled successfully!');
    } catch (error) {
      alert(error.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/doctors', formData);
      setIsModalOpen(false);
      setFormData({
        first_name: '', last_name: '', specialization: '', phone: '',
        email: '', license_number: '', shift_start: '09:00', shift_end: '17:00'
      });
      fetchDoctors(); // Refresh list
    } catch (error) {
      alert(error.message || 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p className="text-muted">Manage doctor profiles and schedules</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Add Doctor</Button>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Shift</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No doctors found.</td></tr>
              ) : doctors.map((doctor) => (
                <tr key={doctor.doctor_id}>
                  <td>#{doctor.doctor_id}</td>
                  <td style={{ fontWeight: 500 }}>{doctor.first_name} {doctor.last_name}</td>
                  <td className="text-muted">{doctor.specialization}</td>
                  <td>{formatTime12h(doctor.shift_start)} - {formatTime12h(doctor.shift_end)}</td>
                  <td>
                    <span className={`status-badge ${doctor.is_active ? 'status-active' : 'status-inactive'}`}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button variant="ghost" className="text-sm" onClick={() => openScheduleModal(doctor)}>Schedule</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Doctor">
        <form onSubmit={handleAddDoctor}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input type="text" name="license_number" value={formData.license_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <TimePicker
              label="Shift Start"
              value={formData.shift_start}
              onChange={(val) => setFormData({ ...formData, shift_start: val })}
              required
            />
            <TimePicker
              label="Shift End"
              value={formData.shift_end}
              onChange={(val) => setFormData({ ...formData, shift_end: val })}
              required
            />
          </div>
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Doctor'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title={`Schedule: Dr. ${selectedDoctor?.last_name || ''}`}>
        <form onSubmit={handleBookAppointment}>
          <div className="form-group">
            <label>Patient ID</label>
            <input type="number" name="patient_id" value={scheduleData.patient_id} onChange={handleScheduleChange} required min="1" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="appointment_date" value={scheduleData.appointment_date} onChange={handleScheduleChange} required />
          </div>
          <div className="grid grid-cols-2">
            <TimePicker
              label="Start Time"
              value={scheduleData.start_time}
              onChange={(val) => setScheduleData({ ...scheduleData, start_time: val })}
              required
            />
            <TimePicker
              label="End Time"
              value={scheduleData.end_time}
              onChange={(val) => setScheduleData({ ...scheduleData, end_time: val })}
              required
            />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea name="reason" value={scheduleData.reason} onChange={handleScheduleChange} rows="2" />
          </div>
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
