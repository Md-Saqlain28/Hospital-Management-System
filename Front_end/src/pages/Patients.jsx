import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus } from 'lucide-react';
import { mockPatients } from '../lib/mockData';
import './Shared.css';

const Patients = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p className="text-muted">Manage patient records and registrations</p>
        </div>
        <Button icon={<Plus size={18} />}>Register Patient</Button>
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>#{patient.id}</td>
                  <td style={{ fontWeight: 500 }}>{patient.name}</td>
                  <td className="text-muted">{patient.age} / {patient.gender}</td>
                  <td><span style={{color: 'var(--danger)', fontWeight: 'bold'}}>{patient.bloodGroup}</span></td>
                  <td>{patient.phone}</td>
                  <td>
                    <span className={`status-badge ${patient.status === 'Admitted' ? 'status-admitted' : 'status-discharged'}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <Button variant="ghost" className="text-sm">View</Button>
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

export default Patients;

