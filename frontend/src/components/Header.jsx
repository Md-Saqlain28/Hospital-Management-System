import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, UserCircle, LogOut, Settings, User } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { api } from '../lib/api';
import './Header.css';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [lastReadTime, setLastReadTime] = useState(() => {
    return localStorage.getItem('lastReadNotifs') || new Date(0).toISOString();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ patients: [], doctors: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      // Fetch appointments to use as notifications
      const appts = await api.get('/appointments?limit=5');
      if (appts && Array.isArray(appts)) {
        // Sort by created_at descending if possible to show newest first
        const sorted = appts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ patients: [], doctors: [] });
      setShowSearchResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/doctors')
        ]);
        
        // Patients API might return { data: [...] } due to pagination
        const allPatients = patientsRes.data || patientsRes || [];
        const allDoctors = doctorsRes.data || doctorsRes || [];

        const q = searchQuery.toLowerCase();
        
        const filteredPatients = allPatients.filter(p => {
          const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
          return fullName.includes(q) || p.phone.includes(q);
        }).slice(0, 3);

        const filteredDoctors = allDoctors.filter(d => {
          const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
          const fullNameWithDr = `dr ${fullName}`;
          const fullNameWithDrDot = `dr. ${fullName}`;
          return fullName.includes(q) || 
                 fullNameWithDr.includes(q) || 
                 fullNameWithDrDot.includes(q) || 
                 d.specialization.toLowerCase().includes(q);
        }).slice(0, 3);

        setSearchResults({ patients: filteredPatients, doctors: filteredDoctors });
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    fetchNotifs();
    // Listen for new appointments being scheduled in other components
    window.addEventListener('appointmentScheduled', fetchNotifs);
    return () => window.removeEventListener('appointmentScheduled', fetchNotifs);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleMarkAllRead = () => {
    const now = new Date().toISOString();
    setLastReadTime(now);
    localStorage.setItem('lastReadNotifs', now);
  };

  const unreadCount = notifications.filter(n => new Date(n.created_at) > new Date(lastReadTime)).length;

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <header className="header glass">
      <div className="search-bar-container" ref={searchRef} style={{ position: 'relative' }}>
        <div className="search-bar">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search patients, doctors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
        </div>
        {showSearchResults && (
          <div className="dropdown-menu search-dropdown">
            {isSearching ? (
              <div style={{ padding: '1rem', textAlign: 'center' }} className="text-muted">Searching...</div>
            ) : searchResults.patients.length === 0 && searchResults.doctors.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center' }} className="text-muted">No results found for "{searchQuery}"</div>
            ) : (
              <div className="search-results-list">
                {searchResults.patients.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Patients</div>
                    {searchResults.patients.map(p => (
                      <div key={p.patient_id} className="search-item" onClick={() => window.location.href='/patients'}>
                        <div className="search-item-title">{p.first_name} {p.last_name}</div>
                        <div className="search-item-subtitle">Phone: {p.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.doctors.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Doctors</div>
                    {searchResults.doctors.map(d => (
                      <div key={d.doctor_id} className="search-item" onClick={() => window.location.href='/doctors'}>
                        <div className="search-item-title">Dr. {d.first_name} {d.last_name}</div>
                        <div className="search-item-subtitle">{d.specialization}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="header-actions">
        
        <div className="dropdown-container" ref={notifRef}>
          <button className="icon-button" onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfileMenu(false);
          }}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu notif-menu">
              <div className="dropdown-header">
                <h4>Notifications</h4>
              </div>
              <ul className="dropdown-list">
                {unreadCount === 0 ? (
                  <li className="dropdown-item" style={{ justifyContent: 'center' }}>
                    <p className="text-muted">No new notifications.</p>
                  </li>
                ) : (
                  notifications.filter(n => new Date(n.created_at) > new Date(lastReadTime)).map(notif => {
                    return (
                      <li key={notif.appointment_id} className="dropdown-item unread">
                        <div className="notif-dot"></div>
                        <div className="notif-content">
                          <p>New appointment for <strong>{notif.patient_first_name} {notif.patient_last_name}</strong> with Dr. {notif.doctor_last_name}.</p>
                          <span className="notif-time">{getTimeAgo(notif.created_at)}</span>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="dropdown-footer">
                <button className="text-button" onClick={handleMarkAllRead}>Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        <div className="dropdown-container" ref={profileRef}>
          <div className="user-profile" onClick={() => {
            setShowProfileMenu(!showProfileMenu);
            setShowNotifications(false);
          }}>
            <div className="user-info">
              <span className="user-name">Dr. Sarah Jenkins</span>
              <span className="user-role">Admin / Cardiologist</span>
            </div>
            <UserCircle size={36} className="user-avatar" />
          </div>

          {showProfileMenu && (
            <div className="dropdown-menu profile-menu">
              <ul className="dropdown-list">
                <li className="dropdown-item" onClick={() => {
                  setIsProfileModalOpen(true);
                  setShowProfileMenu(false);
                }}>
                  <User size={16} /> My Profile
                </li>
                <li className="dropdown-item" onClick={() => {
                  setIsSettingsModalOpen(true);
                  setShowProfileMenu(false);
                }}>
                  <Settings size={16} /> Settings
                </li>
                <li className="dropdown-divider"></li>
                <li className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} /> Log out
                </li>
              </ul>
            </div>
          )}
        </div>

      </div>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="My Profile">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <UserCircle size={80} style={{ color: 'var(--primary-color)', margin: '0 auto' }} />
          <h3 style={{ margin: '0.5rem 0 0.25rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>Dr. Sarah Jenkins</h3>
          <p className="text-muted" style={{ margin: 0 }}>Admin / Cardiologist</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><strong style={{ color: 'var(--text-main)' }}>Employee ID:</strong> <br/><span className="text-muted">EMP-2049</span></div>
          <div><strong style={{ color: 'var(--text-main)' }}>Email:</strong> <br/><span className="text-muted">sarah.j@medcare.com</span></div>
          <div><strong style={{ color: 'var(--text-main)' }}>Phone:</strong> <br/><span className="text-muted">+1 (555) 123-4567</span></div>
          <div><strong style={{ color: 'var(--text-main)' }}>Department:</strong> <br/><span className="text-muted">Cardiology</span></div>
        </div>
        <div className="form-group">
          <label>Update Status</label>
          <select defaultValue="Available">
            <option>Available</option>
            <option>In Surgery</option>
            <option>On Leave</option>
            <option>Do Not Disturb</option>
          </select>
        </div>
        <Button style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setIsProfileModalOpen(false)}>Save Changes</Button>
      </Modal>

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="System Settings">
        <div className="form-group">
          <label>Theme Preference</label>
          <select defaultValue="Light">
            <option>Light (Medical Emerald)</option>
            <option>Dark Mode</option>
            <option>System Default</option>
          </select>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-main)' }}>Notifications</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="checkbox" id="email-notif" defaultChecked style={{ width: 'auto' }} />
            <label htmlFor="email-notif" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>Receive Email Notifications</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="sms-notif" defaultChecked style={{ width: 'auto' }} />
            <label htmlFor="sms-notif" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>Receive SMS Alerts for Emergencies</label>
          </div>
        </div>
        <div className="form-group">
          <label>Language</label>
          <select defaultValue="English">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <Button style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setIsSettingsModalOpen(false)}>Save Settings</Button>
      </Modal>
    </header>
  );
};

export default Header;