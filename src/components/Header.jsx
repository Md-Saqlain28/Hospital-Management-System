import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header glass">
      <div className="search-bar">
        <Search size={18} className="text-muted" />
        <input type="text" placeholder="Search patients, doctors, or appointments..." />
      </div>
      <div className="header-actions">
        <button className="icon-button">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Dr. Sarah Jenkins</span>
            <span className="user-role">Admin / Cardiologist</span>
          </div>
          <UserCircle size={36} className="user-avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;