import React, { useState, useEffect } from "react";
import { Users, UserRoundCog, BedDouble, CalendarCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../components/Card";
import { api } from "../lib/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    rooms: 0,
    todayAppts: 0
  });
  const [trends, setTrends] = useState({
    patients: '+0% this month',
    doctors: 'Normal capacity',
    rooms: '0% capacity',
    todayAppts: '0% from yesterday'
  });

  // Mock data for the admission trends graph
  const admissionData = [
    { name: 'Mon', patients: 12 },
    { name: 'Tue', patients: 19 },
    { name: 'Wed', patients: 15 },
    { name: 'Thu', patients: 22 },
    { name: 'Fri', patients: 28 },
    { name: 'Sat', patients: 14 },
    { name: 'Sun', patients: 8 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingAppts(true);
        const appts = await api.get('/appointments?limit=4');
        setRecentAppointments(appts || []);

        const today = new Date();
        const tzOffset = today.getTimezoneOffset() * 60000;
        const localISOTime = new Date(Date.now() - tzOffset).toISOString();
        const todayStr = localISOTime.split('T')[0];
        
        const yesterday = new Date(Date.now() - 86400000);
        const yesterdayLocalISO = new Date(yesterday.getTime() - tzOffset).toISOString();
        const yesterdayStr = yesterdayLocalISO.split('T')[0];
        
        const [patientsRes, doctorsRes, roomsRes, todayApptsRes, yesterdayApptsRes] = await Promise.all([
          api.get('/patients?limit=10000'), // Fetch all to calculate trends
          api.get('/doctors'),
          api.get('/rooms'),
          api.get(`/appointments?date=${todayStr}`),
          api.get(`/appointments?date=${yesterdayStr}`)
        ]);

        const allPatients = patientsRes?.data || [];
        const totalPatients = patientsRes?.meta?.total || allPatients.length;
        
        const allDoctors = Array.isArray(doctorsRes) ? doctorsRes : (doctorsRes?.data || []);
        const totalDoctors = allDoctors.filter(d => d.is_active).length;
        
        const allRooms = Array.isArray(roomsRes) ? roomsRes : (roomsRes?.data || []);
        const availableRooms = allRooms.filter(r => r.status === 'Available').length;
        
        const todayAppts = Array.isArray(todayApptsRes) ? todayApptsRes.length : (todayApptsRes?.data?.length || 0);
        const yesterdayAppts = Array.isArray(yesterdayApptsRes) ? yesterdayApptsRes.length : (yesterdayApptsRes?.data?.length || 0);

        // Calculate Patients Trend
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let thisMonthCount = 0;
        let lastMonthCount = 0;
        allPatients.forEach(p => {
          if (!p.created_at) return;
          const d = new Date(p.created_at);
          if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
            thisMonthCount++;
          } else if (
            (currentMonth === 0 && d.getFullYear() === currentYear - 1 && d.getMonth() === 11) ||
            (currentMonth > 0 && d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1)
          ) {
            lastMonthCount++;
          }
        });
        
        let patientTrendText = '+0% this month';
        if (lastMonthCount === 0) {
          patientTrendText = `+${thisMonthCount} this month`;
        } else {
          const ptPercent = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
          patientTrendText = `${ptPercent >= 0 ? '+' : ''}${ptPercent}% this month`;
        }

        // Calculate Appointments Trend
        let apptTrendText = '0% from yesterday';
        if (yesterdayAppts === 0) {
          apptTrendText = `+${todayAppts} from yesterday`;
        } else {
          const apptPercent = Math.round(((todayAppts - yesterdayAppts) / yesterdayAppts) * 100);
          apptTrendText = `${apptPercent >= 0 ? '+' : ''}${apptPercent}% from yesterday`;
        }

        // Calculate Rooms Trend
        const totalRoomCount = allRooms.length;
        const occupiedPercent = totalRoomCount === 0 ? 0 : Math.round(((totalRoomCount - availableRooms) / totalRoomCount) * 100);
        
        // Calculate Doctors Trend
        const doctorTrendText = (totalDoctors < allDoctors.length * 0.8) ? 'Short staffed' : 'Normal capacity';

        setStats({
          patients: totalPatients,
          doctors: totalDoctors,
          rooms: availableRooms,
          todayAppts: todayAppts
        });

        setTrends({
          patients: patientTrendText,
          doctors: doctorTrendText,
          rooms: `${occupiedPercent}% capacity`,
          todayAppts: apptTrendText
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoadingAppts(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };
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
            <p className="stat-number">{stats.patients.toLocaleString()}</p>
            <span className={`stat-trend ${trends.patients.startsWith('+') || trends.patients.startsWith('0') ? 'positive' : 'negative'}`}>
              {trends.patients}
            </span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon doctor-icon">
            <UserRoundCog size={24} />
          </div>
          <div className="stat-content">
            <h3>Doctors on Duty</h3>
            <p className="stat-number">{stats.doctors}</p>
            <span className={`stat-trend ${trends.doctors === 'Normal capacity' ? 'neutral' : 'negative'}`}>
              {trends.doctors}
            </span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon room-icon">
            <BedDouble size={24} />
          </div>
          <div className="stat-content">
            <h3>Available Rooms</h3>
            <p className="stat-number">{stats.rooms}</p>
            <span className="stat-trend neutral">{trends.rooms}</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon appt-icon">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Today's Appts</h3>
            <p className="stat-number">{stats.todayAppts}</p>
            <span className={`stat-trend ${trends.todayAppts.startsWith('-') ? 'negative' : 'positive'}`}>
              {trends.todayAppts}
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 dashboard-charts">
        <Card title="Patient Admission Trends">
          <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={admissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--surface-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: 'var(--primary-color)', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="patients" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary-color)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Upcoming Appointments">
          <ul className="appt-list">
            {loadingAppts ? (
              <li className="appt-item" style={{ justifyContent: 'center', padding: '2rem' }}>
                <p className="text-muted">Loading appointments...</p>
              </li>
            ) : recentAppointments.length === 0 ? (
              <li className="appt-item" style={{ justifyContent: 'center', padding: '2rem' }}>
                <p className="text-muted">No upcoming appointments.</p>
              </li>
            ) : (
              recentAppointments.map((appt) => (
                <li className="appt-item" key={appt.appointment_id}>
                  <div className="appt-time">{formatTime(appt.start_time)}</div>
                  <div className="appt-details">
                    <h4>{appt.patient_first_name} {appt.patient_last_name}</h4>
                    <p>{appt.specialization || 'General Checkup'}</p>
                  </div>
                  <div className={`appt-status ${
                    appt.status === 'Scheduled' ? 'badge-warning' : 
                    appt.status === 'Completed' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {appt.status}
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
