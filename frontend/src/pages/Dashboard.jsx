import React from "react";
import { Users, UserRoundCog, BedDouble, CalendarCheck } from "lucide-react";
import Card from "../components/Card";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Welcome back, Dr. Sarah Jenkins</p>
      </div>

      <div className="grid grid-cols-4 dashboard-stats">
        <Card className="stat-card">
          <div className="stat-icon patient-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Patients</h3>
            <p className="stat-number">1,284</p>
            <span className="stat-trend positive">+12% this month</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon doctor-icon">
            <UserRoundCog size={24} />
          </div>
          <div className="stat-content">
            <h3>Doctors on Duty</h3>
            <p className="stat-number">24</p>
            <span className="stat-trend neutral">Normal capacity</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon room-icon">
            <BedDouble size={24} />
          </div>
          <div className="stat-content">
            <h3>Available Rooms</h3>
            <p className="stat-number">42</p>
            <span className="stat-trend negative">8 beds short</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon appt-icon">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Today's Appts</h3>
            <p className="stat-number">86</p>
            <span className="stat-trend positive">+5% from yesterday</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 dashboard-charts">
        <Card title="Patient Admission Trends">
          <div className="placeholder-chart">
            <p className="text-muted">Chart visualization goes here</p>
          </div>
        </Card>
        <Card title="Upcoming Appointments">
          <ul className="appt-list">
            <li className="appt-item">
              <div className="appt-time">10:00 AM</div>
              <div className="appt-details">
                <h4>Alice Smith</h4>
                <p>Cardiology Checkup</p>
              </div>
              <div className="appt-status badge-success">Confirmed</div>
            </li>
            <li className="appt-item">
              <div className="appt-time">11:30 AM</div>
              <div className="appt-details">
                <h4>Diana Prince</h4>
                <p>Follow-up</p>
              </div>
              <div className="appt-status badge-warning">Pending</div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
