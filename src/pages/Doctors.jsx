import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus } from 'lucide-react';
import { mockDoctors } from '../lib/mockData';
import './Shared.css';

const Doctors = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p className="text-muted">Manage doctor profiles and schedules</p>
        </div>
        <Button icon={<Plus size={18} />}>Add Doctor</Button>
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
              {mockDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>#{doctor.id}</td>
                  <td style={{ fontWeight: 500 }}>{doctor.name}</td>
                  <td className="text-muted">{doctor.specialization}</td>
                  <td>{doctor.shift}</td>
                  <td>
                    <span className={`status-badge ${doctor.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                      {doctor.status}
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
    </div>
  );
};

export default Doctors;
