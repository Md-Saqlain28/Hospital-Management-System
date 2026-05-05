import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { CalendarPlus } from 'lucide-react';
import { api } from '../lib/api';
import './Shared.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
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
      const payload = {
        ...formData,
        patient_id: parseInt(formData.patient_id, 10),
        doctor_id: parseInt(formData.doctor_id, 10)
      };
      await api.post('/appointments', payload);
      setIsModalOpen(false);
      setFormData({ patient_id: '', doctor_id: '', appointment_date: '', start_time: '', end_time: '', reason: '' });
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
                    <div className="text-muted">{appt.start_time} - {appt.end_time}</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required />
            </div>
          </div>
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
