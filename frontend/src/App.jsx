import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Database, Zap, Shield, Settings, Sun, Moon, Upload, BarChart3, Lock, Download, Users, Plus, X, Search, Edit2, Trash2, Fingerprint, Utensils, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import './App.css';

function App() {
  // --- DYNAMIC API URL (Gets from .env or defaults to localhost) ---
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

  const mockQueries = [
    { id: 'Q12A', query: "SELECT * FROM students WHERE room_no = 'A-101'", duration: '14ms', user: 'Admin' },
    { id: 'Q12B', query: "UPDATE rooms SET occupancy = occupancy + 1 WHERE room_no = 'A-102'", duration: '22ms', user: 'System' },
    { id: 'Q13C', query: "SELECT diet_preference, count(*) FROM mess_records GROUP BY diet_preference", duration: '85ms', user: 'Admin' },
    { id: 'Q14D', query: "DELETE FROM gate_passes WHERE expiry_date < date('now')", duration: '102ms', user: 'System' },
  ];

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
        setAuthData({ username: '', password: '' });
      } else { setAuthError(responseData.error); }
    } catch (err) { setAuthError('Server connection failed. Is backend running?'); }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    setActiveTab('overview');
  };

  const filteredStudents = data.students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.room_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const currentStudentsData = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => { setPage(1); }, [searchQuery]);

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
        setFormData({ name: '', course: 'B.Tech CSE', semester: '4', room_no: 'A-102' }); 
        setEditingId(null);
      }
    } catch (error) { console.error("Failed to save:", error); }
  };

  const handleEditClick = (student) => {
    setFormData({ name: student.name, course: student.course, semester: student.semester, room_no: student.room_no });
    setEditingId(student.student_id);
    setShowAddModal(true);
  };

  const handleDeleteStudent = async (student_id) => {
    if (window.confirm(`Are you sure you want to delete ${student_id}?`)) {
      try {
        const response = await fetch(`${API_URL}/api/students/${student_id}`, { method: 'DELETE' });
        if (response.ok) fetchData();
      } catch (error) { console.error("Failed to delete:", error); }
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', course: 'B.Tech CSE', semester: '4', room_no: 'A-102' });
    setEditingId(null);
    setShowAddModal(true);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // ==========================================
  // VIEW 1: THE LANDING PAGE
  // ==========================================
  if (currentView === 'landing') {
    return (
      <div className="landing-page">
        <nav className="landing-nav fade-in">
          <div className="logo-area">
            <BarChart3 className="brand-icon" size={32} />
            <h2 className="website-name">HOSTEL DBMS</h2>
          </div>
          <button className="login-btn" onClick={() => setShowAuthModal(true)}>
            Admin Login
          </button>
        </nav>

        <main className="hero-section fade-in">
          <div className="hero-content">
            <span className="hero-badge">IGDTUW Project Edition</span>
            <h1 className="hero-title">Simplified Hostel Living, Powered by Data.</h1>
            <p className="hero-subtitle">
              A robust Database Management System designed to handle complex room allocations, live entry logs, and strict dietary constraints seamlessly.
            </p>
            <div className="cta-group">
              <button className="cta-primary" onClick={() => setShowAuthModal(true)}>
                Access Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="hero-visuals">
            <div className="floating-card card-1">
              <div className="icon-box icon-green" style={{background:'var(--color-green-bg)', color:'var(--color-green)'}}><Fingerprint size={20} /></div>
              <div>
                <h4>Biometric Synced</h4>
                <p>Entry Logged: STU-2541 at 10:09 AM</p>
              </div>
            </div>

            <div className="floating-card card-2">
              <div className="icon-box icon-orange" style={{background:'var(--color-orange-bg)', color:'var(--color-orange)'}}><Utensils size={20} /></div>
              <div>
                <h4>Dietary Edge-Case Managed</h4>
                <p>Non-Veg (Strictly No Seafood/Fish)</p>
              </div>
            </div>

            <div className="floating-card card-3">
              <div className="icon-box icon-blue" style={{background:'var(--color-blue-bg)', color:'var(--color-blue)'}}><CheckCircle2 size={20} /></div>
              <div>
                <h4>Dynamic Allocation</h4>
                <p>Room D-296 Updated Successfully</p>
              </div>
            </div>
          </div>
        </main>

        {showAuthModal && (
          <div className="modal-overlay fade-in">
            <div className="modal-content" style={{width: '380px', color: 'var(--text-main)'}}>
              <div className="modal-header" style={{marginBottom: '1rem'}}>
                <h3>{isLoginMode ? 'Admin Login' : 'Create Account'}</h3>
                <button className="close-btn" onClick={() => {setShowAuthModal(false); setAuthError('');}}><X size={24}/></button>
              </div>
              {authError && <div className="auth-error">{authError}</div>}
              <form onSubmit={handleAuthSubmit}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" required placeholder="e.g. admin" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" required placeholder="••••••••" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
                </div>
                <button type="submit" className="submit-btn">{isLoginMode ? 'Sign In' : 'Sign Up'}</button>
              </form>
              <div className="auth-switch">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                <span onClick={() => {setIsLoginMode(!isLoginMode); setAuthError('');}}>{isLoginMode ? 'Sign up' : 'Log in'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE ADMIN DASHBOARD
  // ==========================================
  if (loading) return <div className={`loading-screen ${theme}`}>Initializing Hostel DB...</div>;

  const chartData = data.rooms
    .filter(room => room.room_no.startsWith(selectedBlock + '-'))
    .slice(0, 50)
    .map((room) => ({ name: `Rm ${room.room_no}`, Capacity: room.capacity, Occupancy: room.occupancy }));

  const totalCapacity = data.rooms.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalOccupancy = data.rooms.reduce((acc, curr) => acc + curr.occupancy, 0);

  return (
    <div className={`app-container ${theme}`}>
      <aside className="sidebar">
        <div>
          <div className="logo-area" onClick={() => setCurrentView('landing')} style={{cursor: 'pointer'}}>
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
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>{greeting}, <strong>Admin</strong></h1>
            <p>Manage hostel allocation and database infrastructure.</p>
          </div>
          <div className="header-controls">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="dashboard-view fade-in">
             <div className="resources-grid">
              <div className="resource-card hover-3d">
                <div className="card-top"><div className="icon-box icon-green"><Shield size={20}/></div><span>Total Capacity</span></div>
                <div className="card-body"><div className="big-number">{totalCapacity}</div></div>
              </div>
              <div className="resource-card hover-3d">
                <div className="card-top"><div className="icon-box icon-blue"><Users size={20}/></div><span>Registered Students</span></div>
                <div className="card-body"><div className="big-number">{data.students.length}</div></div>
              </div>
              <div className="resource-card hover-3d">
                <div className="card-top"><div className="icon-box icon-orange"><LayoutDashboard size={20}/></div><span>Available Beds</span></div>
                <div className="card-body"><div className="big-number">{totalCapacity - totalOccupancy}</div></div>
              </div>
            </div>

            <div className="stacked-grid">
              <div className="data-panel hover-3d table-panel">
                <h3 style={{ color: 'var(--text-main)' }}>Recent Allocations</h3>
                <div className="scrollable-table" style={{ height: '300px', overflowY: 'auto' }}>
                  <table style={{ width: '100%' }}>
                    <thead><tr><th>ID</th><th>Name</th><th>Course</th><th>Room No</th></tr></thead>
                    <tbody>
                      {currentStudentsData.map((student) => (
                        <tr key={student.student_id}>
                          <td className="id-col">{student.student_id}</td>
                          <td style={{fontWeight: '500'}}>{student.name}</td>
                          <td className="text-muted">{student.course}</td>
                          <td><span className="status-badge">{student.room_no}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', background: 'transparent', color: page === 1 ? 'var(--text-muted)' : 'var(--color-blue)', border: `1px solid ${page === 1 ? 'var(--border-color)' : 'var(--color-blue)'}`, borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '600' }}>Previous</button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 12px', background: 'transparent', color: page === totalPages ? 'var(--text-muted)' : 'var(--color-blue)', border: `1px solid ${page === totalPages ? 'var(--border-color)' : 'var(--color-blue)'}`, borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: '600' }}>Next</button>
                </div>
              </div>

              <div className="data-panel hover-3d">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                  <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Room Occupancy Trends</h3>
                  <select 
                    value={selectedBlock} 
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontWeight: '500', cursor: 'pointer' }}
                  >
                    {['A','B','C','D','E','F','G','H','I','J'].map(b => <option key={b} value={b}>Block {b}</option>)}
                  </select>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{top: 20, right: 0, left: -20, bottom: 0}}>
                      <defs><linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.4}/><stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" tick={{fill: 'var(--text-muted)', fontSize: 10}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', borderRadius: '10px', color: 'var(--text-main)'}} />
                      <Area type="monotone" dataKey="Capacity" stroke="var(--border-color)" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="Occupancy" stroke="var(--color-blue)" strokeWidth={3} fill="url(#colorUsage)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'databases' && (
          <div className="fade-in data-panel hover-3d">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="icon-box icon-purple"><Database size={24} /></div>
                <div><h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>Complete Student Records</h2><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full view of database entries.</p></div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div className="search-container">
                  <Search size={18} color="var(--text-muted)" />
                  <input type="text" placeholder="Search ID, Name or Room..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  <Plus size={18} /> Add New Student
                </button>
              </div>
            </div>
            
            <div className="scrollable-table" style={{ height: '450px', overflowY: 'auto' }}>
              <table style={{ width: '100%', display: 'table' }}>
                <thead><tr><th>Student ID</th><th>Name</th><th>Academic Info</th><th>Allocated Room</th><th>Actions</th></tr></thead>
                <tbody>
                  {currentStudentsData.length > 0 ? currentStudentsData.map((student, i) => (
                    <tr key={i}>
                      <td className="id-col">{student.student_id}</td>
                      <td style={{fontWeight: '500'}}>{student.name}</td>
                      <td className="text-muted">Sem {student.semester} - {student.course}</td>
                      <td><span className="status-badge">{student.room_no}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={() => handleEditClick(student)}><Edit2 size={16} /></button>
                          <button className="action-btn delete" onClick={() => handleDeleteStudent(student.student_id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No records matched your search.</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', background: 'transparent', color: page === 1 ? 'var(--text-muted)' : 'var(--color-blue)', border: `1px solid ${page === 1 ? 'var(--border-color)' : 'var(--color-blue)'}`, borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '600' }}>Previous</button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 12px', background: 'transparent', color: page === totalPages ? 'var(--text-muted)' : 'var(--color-blue)', border: `1px solid ${page === totalPages ? 'var(--border-color)' : 'var(--color-blue)'}`, borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: '600' }}>Next</button>
            </div>
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="fade-in data-panel hover-3d">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div className="icon-box icon-orange"><Zap size={24} /></div>
              <div><h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>Live Query Log</h2><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Top executing SQL operations on hostel.db.</p></div>
            </div>
            <div className="scrollable-table" style={{ height: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', display: 'table' }}>
                <thead><tr><th>QID</th><th>SQL Query Text</th><th>Execution Time</th><th>Triggered By</th></tr></thead>
                <tbody>
                  {mockQueries.map(q => (
                    <tr key={q.id}>
                      <td className="id-col">#{q.id}</td>
                      <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{q.query}</td>
                      <td style={{ fontWeight: '600' }}>{q.duration}</td>
                      <td>{q.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="fade-in">
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div className="icon-box icon-red"><Shield size={24} /></div>
              <div><h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>Hostel Entry/Exit Logs</h2><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monitoring biometric database streams.</p></div>
            </div>
            <div className="resources-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="resource-card hover-3d">
                <div className="card-top">
                  <div className="icon-box icon-red"><Zap size={20}/></div>
                  <span>Late Entries (Today)</span>
                </div>
                <div className="card-body"><div className="big-number">4</div><div className="trend-badge negative">Requires Action</div></div>
              </div>
              <div className="resource-card hover-3d">
                <div className="card-top">
                  <div className="icon-box icon-green"><Lock size={20}/></div>
                  <span>Gate Pass Validations</span>
                </div>
                <div className="card-body"><div className="big-number">42</div><div className="trend-badge positive">All verified</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fade-in data-panel hover-3d">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <div className="icon-box icon-purple"><Settings size={24} /></div>
              <div><h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>System Configurations</h2><p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage preferences and database rules.</p></div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', color: 'var(--text-main)' }}>Database Rules</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ padding: '15px', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text-main)' }}>Dashboard Auto-Refresh</label>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none' }}>
                      <option>Off (Manual Refresh)</option>
                      <option>Every 30 Seconds</option>
                      <option>Every 5 Minutes</option>
                    </select>
                  </div>
                  <div style={{ padding: '15px', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text-main)' }}>Server Timezone</label>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none' }}>
                      <option>IST (UTC +5:30)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '10px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                  <Download size={16} /> Export DB Records (.CSV)
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {showAddModal && (
        <div className="modal-overlay fade-in">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? "Edit Student Details" : "Register New Student"}</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveStudent}>
              <div className="form-group"><label>Full Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter student name"/></div>
              <div className="form-group">
                <label>Course</label>
                <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}>
                  <option>B.Tech CSE</option><option>B.Tech IT</option><option>B.Tech ECE</option><option>B.Tech MAE</option><option>B.Arch</option>
                </select>
              </div>
              <div className="form-group"><label>Semester</label><input type="number" min="1" max="8" required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}/></div>
              <div className="form-group"><label>Allocate Room</label><input type="text" required value={formData.room_no} onChange={e => setFormData({...formData, room_no: e.target.value})} placeholder="e.g. A-102"/></div>
              <button type="submit" className="submit-btn">{editingId ? "Update Database" : "Save to Database"}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;