import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { CalendarPlus } from 'lucide-react';
import { mockAppointments } from '../lib/mockData';
import './Shared.css';

const Appointments = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p className="text-muted">Schedule and manage patient appointments</p>
        </div>
        <Button icon={<CalendarPlus size={18} />}>Book Appointment</Button>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td>
                    <div style={{fontWeight: 600, color: 'var(--primary-color)'}}>{appt.date}</div>
                    <div className="text-muted">{appt.time}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{appt.patient}</td>
                  <td className="text-muted">{appt.doctor}</td>
                  <td>
                    <span className={`status-badge ${appt.status === 'Completed' ? 'status-active' : (appt.status === 'Cancelled' ? 'status-inactive' : 'status-maintenance')}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    <Button variant="secondary" className="text-sm">Manage</Button>
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

export default Appointments;
