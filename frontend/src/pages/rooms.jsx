import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { BedDouble } from 'lucide-react';
import { api } from '../lib/api';
import './Shared.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms');
      setRooms(res || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdmit = (roomId) => {
    console.log("Clicked Admit for Room ID:", roomId);
    setSelectedRoomId(roomId);
    setPatientId('');
    setIsModalOpen(true);
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/rooms/${selectedRoomId}/admit`, {
        patient_id: parseInt(patientId, 10)
      });
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      alert(error.message || 'Admission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async (roomId) => {
    if (!window.confirm('Are you sure you want to discharge this patient?')) return;
    try {
      await api.post(`/rooms/${roomId}/discharge`);
      fetchRooms();
    } catch (error) {
      alert(error.message || 'Failed to discharge patient');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Rooms & Wards</h1>
          <p className="text-muted">Manage room availability and patient admissions</p>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>
      ) : rooms.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>No rooms found.</div>
      ) : (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {rooms.map(room => (
            <Card key={room.room_id} className="text-center" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: room.status === 'Available' ? 'var(--success)' : 'var(--text-muted)' }}>
                <BedDouble size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Room {room.room_number}</h3>
              <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{room.room_type}</p>
              <span className={`status-badge ${room.status === 'Available' ? 'status-active' : (room.status === 'Occupied' ? 'status-inactive' : 'status-maintenance')}`}>
                {room.status}
              </span>
              {room.patient_id && <p className="text-sm" style={{ marginTop: '1rem', fontWeight: 500 }}>Patient #{room.patient_id}</p>}
              <div style={{ marginTop: '1rem' }}>
                {room.status === 'Available' ? (
                  <Button variant="primary" className="text-sm" onClick={() => handleOpenAdmit(room.room_id)}>Admit Patient</Button>
                ) : room.status === 'Occupied' ? (
                   <Button variant="secondary" className="text-sm" onClick={() => handleDischarge(room.room_id)}>Discharge</Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Admit to Room`}>
        <form onSubmit={handleAdmit}>
          <div className="form-group">
            <label>Patient ID</label>
            <input 
              type="number" 
              value={patientId} 
              onChange={(e) => setPatientId(e.target.value)} 
              required 
              min="1" 
              placeholder="Enter Patient ID"
            />
          </div>
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Admitting...' : 'Admit Patient'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Rooms;
