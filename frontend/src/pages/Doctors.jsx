import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import './Shared.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
                  <td>{doctor.shift_start} - {doctor.shift_end}</td>
                  <td>
                    <span className={`status-badge ${doctor.is_active ? 'status-active' : 'status-inactive'}`}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button variant="ghost" className="text-sm">Schedule</Button>
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
            <div className="form-group">
              <label>Shift Start</label>
              <input type="time" name="shift_start" value={formData.shift_start} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Shift End</label>
              <input type="time" name="shift_end" value={formData.shift_end} onChange={handleChange} required />
            </div>
          </div>
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Doctor'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
