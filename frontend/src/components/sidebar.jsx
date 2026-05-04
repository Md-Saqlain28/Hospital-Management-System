import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserRoundCog, CalendarDays, BedDouble, ReceiptText } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/patients', label: 'Patients', icon: <Users size={20} /> },
    { path: '/doctors', label: 'Doctors', icon: <UserRoundCog size={20} /> },
    { path: '/appointments', label: 'Appointments', icon: <CalendarDays size={20} /> },
    { path: '/rooms', label: 'Rooms', icon: <BedDouble size={20} /> },
    { path: '/billing', label: 'Billing', icon: <ReceiptText size={20} /> },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-brand">
        <div className="logo-icon">H</div>
        <h2>MedCare</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;