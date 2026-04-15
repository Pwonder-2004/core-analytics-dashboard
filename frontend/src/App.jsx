import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Database, Zap, Shield, Settings, Sun, Moon, BarChart3, Lock, Download, Users, Plus, X, Search, Edit2, Trash2, Fingerprint, Utensils, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import './App.css';

function App() {
  // --- DYNAMIC API URL ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  const [currentView, setCurrentView] = useState('landing'); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [data, setData] = useState({ students: [], rooms: [], mess_records: [] });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('overview'); 
  const [greeting, setGreeting] = useState('');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const [selectedBlock, setSelectedBlock] = useState('A'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({ name: '', course: 'B.Tech CSE', semester: '4', room_no: 'A-102' });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const fetchData = () => {
    fetch(`${API_URL}/api/data`)
      .then(res => res.json())
      .then(jsonData => { setData(jsonData); setLoading(false); })
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const responseData = await res.json();
      
      if (res.ok) {
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setCurrentView('dashboard');
        setAuthError('');
      } else { setAuthError(responseData.error); }
    } catch (err) { setAuthError('Server connection failed.'); }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    setActiveTab('overview');
  };

  const filteredStudents = data.students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const currentStudentsData = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/api/students/${editingId}` : `${API_URL}/api/students`;
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowAddModal(false); fetchData(); 
        setEditingId(null);
      }
    } catch (error) { console.error("Failed to save:", error); }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // --- VIEW 1: LANDING PAGE ---
  if (currentView === 'landing') {
    return (
      <div className="landing-page">
        <nav className="landing-nav">
          <div className="logo-area">
            <BarChart3 className="brand-icon" size={32} />
            <h2 className="website-name">HOSTEL DBMS</h2>
          </div>
          <div className="nav-actions-mobile">
            <button className="login-btn" onClick={() => setShowAuthModal(true)}>
              Admin Login
            </button>
          </div>
        </nav>

        <main className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">IGDTUW Project Edition</span>
            <h1 className="hero-title">Simplified Hostel Living, Powered by Data.</h1>
            <p className="hero-subtitle">
              A robust Database Management System designed to handle complex room allocations, live entry logs, and dietary constraints seamlessly.
            </p>
            <div className="cta-wrapper-mobile">
              <button className="cta-primary" onClick={() => setShowAuthModal(true)}>
                Access Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="hero-visuals">
            <div className="floating-card card-1">
              <Fingerprint className="icon-green" size={24} />
              <div><h4>Biometric Synced</h4><p>Entry Logged: STU-2541</p></div>
            </div>
            <div className="floating-card card-2">
              <Utensils className="icon-orange" size={24} />
              <div><h4>Dietary Managed</h4><p>Non-Veg (No Seafood)</p></div>
            </div>
            <div className="floating-card card-3">
              <CheckCircle2 className="icon-blue" size={24} />
              <div><h4>Dynamic Allocation</h4><p>Room D-296 Updated</p></div>
            </div>
          </div>
        </main>

        {showAuthModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{isLoginMode ? 'Admin Login' : 'Create Account'}</h3>
                <button className="close-btn" onClick={() => setShowAuthModal(false)}><X size={24}/></button>
              </div>
              {authError && <div className="auth-error">{authError}</div>}
              <form onSubmit={handleAuthSubmit}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" required value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" required value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
                </div>
                <button type="submit" className="submit-btn">{isLoginMode ? 'Sign In' : 'Sign Up'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  if (loading) return <div className={`loading-screen ${theme}`}>Initializing Hostel DB...</div>;

  return (
    <div className={`app-container ${theme}`}>
      <aside className="sidebar">
        <div>
          <div className="logo-area" onClick={() => setCurrentView('landing')}>
            <BarChart3 className="brand-icon" size={28} />
            <h2 className="website-name">HOSTEL DBMS</h2>
          </div>
          <nav className="side-nav">
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><LayoutDashboard size={20} /> Overview</button>
            <button className={`nav-item ${activeTab === 'databases' ? 'active' : ''}`} onClick={() => setActiveTab('databases')}><Database size={20} /> Students DB</button>
            <button className={`nav-item ${activeTab === 'queries' ? 'active' : ''}`} onClick={() => setActiveTab('queries')}><Zap size={20} /> SQL Queries</button>
            <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}><Shield size={20} /> Entry Logs</button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /> Settings</button>
          </nav>
        </div>
        <button className="logout-btn" onClick={handleLogout}><LogOut size={20} /> Log Out</button>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>{greeting}, <strong>Admin</strong></h1>
            <p>System Online</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="dashboard-view">
            <div className="resources-grid">
              <div className="resource-card"><span>Total Capacity</span><div className="big-number">10000</div></div>
              <div className="resource-card"><span>Registered</span><div className="big-number">{data.students.length}</div></div>
              <div className="resource-card"><span>Available</span><div className="big-number">{10000 - data.students.length}</div></div>
            </div>
            <div className="data-panel">
              <h3>Recent Allocations</h3>
              <div className="scrollable-table">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Course</th><th>Room</th></tr></thead>
                  <tbody>
                    {currentStudentsData.map((s) => (
                      <tr key={s.student_id}><td>{s.student_id}</td><td>{s.name}</td><td>{s.course}</td><td>{s.room_no}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="data-panel">
            <h2>System Settings</h2>
            <p className="text-muted">Manage your database preferences here.</p>
            <div style={{marginTop: '2rem'}}>
               <button className="cta-primary"><Download size={18}/> Export Database</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;