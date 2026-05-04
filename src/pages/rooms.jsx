import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { BedDouble } from 'lucide-react';
import { mockRooms } from '../lib/mockData';
import './Shared.css';

const Rooms = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Rooms & Wards</h1>
          <p className="text-muted">Manage room availability and patient admissions</p>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        {mockRooms.map(room => (
          <Card key={room.id} className="text-center" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: room.status === 'Available' ? 'var(--success)' : 'var(--text-muted)' }}>
              <BedDouble size={32} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Room {room.id}</h3>
            <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{room.type}</p>
            <span className={`status-badge ${room.status === 'Available' ? 'status-active' : (room.status === 'Occupied' ? 'status-inactive' : 'status-maintenance')}`}>
              {room.status}
            </span>
            {room.patient && <p className="text-sm" style={{ marginTop: '1rem', fontWeight: 500 }}>{room.patient}</p>}
            <div style={{ marginTop: '1rem' }}>
              {room.status === 'Available' ? (
                <Button variant="primary" className="text-sm">Admit Patient</Button>
              ) : room.status === 'Occupied' ? (
                 <Button variant="secondary" className="text-sm">Discharge</Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
