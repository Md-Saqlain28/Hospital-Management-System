import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { CalendarPlus } from 'lucide-react';
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

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    start_time: '09:00',
    end_time: '10:00',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments');
      setAppointments(res || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const [startHour, startMin] = formData.start_time.split(':');
      const endHourStr = String((parseInt(startHour, 10) + 1) % 24).padStart(2, '0');
      const calculatedEndTime = `${endHourStr}:${startMin}`;

      const payload = {
        ...formData,
        end_time: calculatedEndTime,
        patient_id: parseInt(formData.patient_id, 10),
        doctor_id: parseInt(formData.doctor_id, 10)
      };
      await api.post('/appointments', payload);
      setIsModalOpen(false);
      setFormData({ patient_id: '', doctor_id: '', appointment_date: '', start_time: '09:00', end_time: '10:00', reason: '' });
      fetchAppointments();
    } catch (error) {
      alert(error.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (error) {
      alert(error.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p className="text-muted">Schedule and manage patient appointments</p>
        </div>
        <Button icon={<CalendarPlus size={18} />} onClick={() => setIsModalOpen(true)}>Book Appointment</Button>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient ID</th>
                <th>Doctor ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No appointments found.</td></tr>
              ) : appointments.map((appt) => (
                <tr key={appt.appointment_id}>
                  <td>
                    <div style={{fontWeight: 600, color: 'var(--primary-color)'}}>
                      {new Date(appt.appointment_date).toLocaleDateString()}
                    </div>
                    <div className="text-muted">{formatTime12h(appt.start_time)} - {formatTime12h(appt.end_time)}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>#{appt.patient_id}</td>
                  <td className="text-muted">#{appt.doctor_id}</td>
                  <td>
                    <span className={`status-badge ${appt.status === 'Completed' ? 'status-active' : (appt.status === 'Cancelled' ? 'status-inactive' : (appt.status === 'Scheduled' ? 'status-maintenance' : 'status-inactive'))}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    {appt.status === 'Scheduled' && (
                      <Button variant="secondary" className="text-sm" onClick={() => handleCancel(appt.appointment_id)}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book Appointment">
        <form onSubmit={handleBook}>
          <div className="form-group">
            <label>Patient ID</label>
            <input type="number" name="patient_id" value={formData.patient_id} onChange={handleChange} required min="1" />
          </div>
          <div className="form-group">
            <label>Doctor ID</label>
            <input type="number" name="doctor_id" value={formData.doctor_id} onChange={handleChange} required min="1" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} required />
          </div>
          <TimePicker
            label="Time"
            value={formData.start_time}
            onChange={(val) => setFormData({ ...formData, start_time: val })}
            required
          />
          <div className="form-group">
            <label>Reason</label>
            <textarea name="reason" value={formData.reason} onChange={handleChange} rows="2" />
          </div>
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
