import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck,
  Library,
  CheckSquare,
  Lightbulb,
  BrainCircuit,
  Bell,
  Search,
  UserCircle,
  Camera,
  Table
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CuroChatbot from './CuroChatbot';

const Sidebar = () => {
  const { user } = useAuth();

  const isAdminRole = user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'teacher';

  const navItems = [
    { path: '/', label: 'Overview Dashboard', icon: <BarChart3 size={20} /> },
    { path: isAdminRole ? '/admin/students' : '/attendance', label: isAdminRole ? 'Class Attendance' : 'My Attendance', icon: <CalendarCheck size={20} /> },
    ...(user?.role === 'teacher' ? [{ path: '/teacher/scanner', label: 'Start Webcam Tracker', icon: <Camera size={20} /> }] : []),
    ...(isAdminRole ? [{ path: '/admin/daily-attendance', label: 'Daily Attendance Sheet', icon: <Table size={20} /> }] : []),
    { path: isAdminRole ? '/admin/subjects' : '/subjects', label: isAdminRole ? 'Class Subjects Analysis' : 'My Subjects Analysis', icon: <Library size={20} /> },
    { path: isAdminRole ? '/admin/tests-quizzes' : '/tests-quizzes', label: isAdminRole ? 'Class Tests & Quizzes' : 'Tests & Quizzes', icon: <CheckSquare size={20} /> },
    { path: isAdminRole ? '/admin/projects' : '/projects', label: isAdminRole ? 'Class Skill Projects' : 'Skill Projects', icon: <Lightbulb size={20} /> },
    { path: isAdminRole ? '/admin/predictions' : '/predictions', label: isAdminRole ? 'Class Intelligence' : 'Success Intelligence', icon: <BrainCircuit size={20} /> },
  ];

  return (
    <aside className="sidebar glass-panel" style={{ borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0 }}>
      <div className="logo">
        <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="INTERVENIX Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
        </div>
        <div className="logo-text">
          <h2 className="text-gradient-primary">INTERVENIX</h2>
          <span>Academic Platform</span>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {(!isAdminRole) && (
        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Academic Health</p>
            {user?.data ? (() => {
              const avgAtt = ((user.data.MATHS_ATT + user.data.CT_ATT + user.data.DE_ATT + user.data.CPP_ATT) / 4);
              const avgScore = ((user.data.MATHS_SCORE + user.data.CT_SCORE + user.data.DE_SCORE + user.data.CPP_SCORE) / 4);
              const healthScore = Math.round((avgScore + avgAtt) / 2);

              return (
                <>
                  <div className="text-gradient-primary" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{healthScore}/100</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>+2.4% this week</p>
                </>
              );
            })() : (
              <div className="text-gradient-primary" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>--/100</div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export const Header = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'teacher') return;

    const fetchNotifications = () => {
      const tests = JSON.parse(localStorage.getItem('adminAssignedTests') || '[]');
      const validTests = tests.filter(t => (Date.now() - t.createdAt) <= 60 * 60 * 1000);
      setNotifications(validTests.map(t => ({
        id: t.id,
        title: 'New Test Assigned',
        message: `Instructor assigned a new assessment: ${t.topic}`,
        time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
    };

    fetchNotifications();

    const handleStorageChange = (e) => {
      if (!e.key || e.key === 'adminAssignedTests') {
        fetchNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-update', fetchNotifications);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-update', fetchNotifications);
    };
  }, [user]);

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '300px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search subjects, tests..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            borderRadius: '99px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ color: 'var(--text-muted)', position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                background: 'var(--danger)',
                borderRadius: '50%',
                boxShadow: '0 0 8px var(--danger)'
              }}></span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '120%',
              right: '0',
              width: '320px',
              padding: '1rem',
              zIndex: 100,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>Notifications</h3>

              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', margin: '1rem 0' }}>No new notifications.</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} style={{ padding: '0.75rem', background: 'var(--primary-glow)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{notif.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-glass)' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || 'Student'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.course || 'Electronics and Communication Engg.'}, {user?.year || '1st year'}</p>
          </div>
          <UserCircle size={36} color="var(--primary)" />

          <button
            onClick={logout}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <CuroChatbot />
    </div>
  );
};

export default Layout;
