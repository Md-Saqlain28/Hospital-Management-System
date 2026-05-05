import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import './Shared.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    blood_group: 'A+',
    emergency_contact: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      setPatients(res.data || []);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (id) => {
    try {
      setLoadingDetails(true);
      setIsViewModalOpen(true);
      const res = await api.get(`/patients/${id}`);
      setSelectedPatient(res);
    } catch (error) {
      alert('Failed to load patient details');
      setIsViewModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10)
      };
      
      // Clean up empty optional fields so Zod doesn't throw validation errors
      if (!payload.email) delete payload.email;
      if (!payload.address) delete payload.address;
      if (!payload.emergency_contact) delete payload.emergency_contact;

      await api.post('/patients', payload);
      setIsModalOpen(false);
      setFormData({
        first_name: '', last_name: '', date_of_birth: '', age: '',
        gender: 'Male', phone: '', email: '', address: '', blood_group: 'A+', emergency_contact: ''
      });
      fetchPatients(); // Refresh list
    } catch (error) {
      alert(error.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p className="text-muted">Manage patient records and registrations</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Register Patient</Button>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age / Gender</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No patients found.</td></tr>
              ) : patients.map((patient) => (
                <tr key={patient.patient_id}>
                  <td>#{patient.patient_id}</td>
                  <td style={{ fontWeight: 500 }}>{patient.first_name} {patient.last_name}</td>
                  <td className="text-muted">{patient.age} / {patient.gender}</td>
                  <td><span style={{color: 'var(--danger)', fontWeight: 'bold'}}>{patient.blood_group || 'N/A'}</span></td>
                  <td>{patient.phone}</td>
                  <td>
                    <Button variant="ghost" className="text-sm" onClick={() => handleViewPatient(patient.patient_id)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Patient">
        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required min="1" max="150" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input type="tel" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" />
          </div>
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Registering...' : 'Register Patient'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Patient Details">
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading details...</div>
        ) : selectedPatient ? (
          <div className="patient-details">
            <div className="grid grid-cols-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
              <div><strong style={{ color: 'var(--text-main)' }}>Name:</strong> <br/><span className="text-muted">{selectedPatient.first_name} {selectedPatient.last_name}</span></div>
              <div><strong style={{ color: 'var(--text-main)' }}>ID:</strong> <br/><span className="text-muted">#{selectedPatient.patient_id}</span></div>
              <div><strong style={{ color: 'var(--text-main)' }}>Date of Birth:</strong> <br/><span className="text-muted">{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</span></div>
              <div><strong style={{ color: 'var(--text-main)' }}>Age:</strong> <br/><span className="text-muted">{selectedPatient.age} years</span></div>
              <div><strong style={{ color: 'var(--text-main)' }}>Gender:</strong> <br/><span className="text-muted">{selectedPatient.gender}</span></div>
              <div><strong style={{ color: 'var(--text-main)' }}>Blood Group:</strong> <br/><span className="text-muted" style={{color: 'var(--danger)', fontWeight: 'bold'}}>{selectedPatient.blood_group || 'N/A'}</span></div>
              <div><strong style={{ color: 'var(--text-main)' }}>Phone:</strong> <br/><span className="text-muted">{selectedPatient.phone}</span></div>
              <div><strong style={{ color: 'var(--text-main)' }}>Email:</strong> <br/><span className="text-muted">{selectedPatient.email || 'N/A'}</span></div>
              <div style={{ gridColumn: 'span 2' }}><strong style={{ color: 'var(--text-main)' }}>Emergency Contact:</strong> <br/><span className="text-muted">{selectedPatient.emergency_contact || 'N/A'}</span></div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ color: 'var(--text-main)' }}>Address:</strong>
                <p className="text-muted" style={{ marginTop: '0.25rem' }}>{selectedPatient.address || 'N/A'}</p>
              </div>
            </div>
            <Button onClick={() => setIsViewModalOpen(false)} style={{ width: '100%' }}>Close</Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Could not load patient.</div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
