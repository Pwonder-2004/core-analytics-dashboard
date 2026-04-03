import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Database, Zap, Shield, Settings, Sun, Moon, Upload, BarChart3, Binary, Lock, Key } from 'lucide-react';
import './App.css';

function App() {
  const [data, setData] = useState({ users: [], products: [], orders: [], db_counts: [] });
  const [loading, setLoading] = useState(true);
  // Defaulting to light theme so you see the new look immediately!
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('overview');
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data')
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  if (loading) return <div className={`loading-screen ${theme}`}>Initializing Core Analytics...</div>;

  // Updated Mock Data for the Graph to match your image (Two lines: Blue & Red)
  const activityData = [
    { time: 'Jan', current: 12, previous: 22 },
    { time: 'Feb', current: 18, previous: 18 },
    { time: 'Mar', current: 35, previous: 25 },
    { time: 'Apr', current: 20, previous: 15 },
    { time: 'May', current: 28, previous: 30 },
    { time: 'Jun', current: 45, previous: 28 },
    { time: 'Jul', current: 38, previous: 28 },
    { time: 'Aug', current: 48, previous: 26 },
    { time: 'Sep', current: 52, previous: 24 },
    { time: 'Oct', current: 40, previous: 20 },
  ];

  const recentQueries = [
    { id: 1, sql: "SELECT * FROM orders WHERE status='pending'", time: "45ms", status: "Slow" },
    { id: 2, sql: "UPDATE users SET last_login=NOW() WHERE id=102", time: "12ms", status: "Fast" },
    { id: 3, sql: "SELECT count(*) FROM products", time: "8ms", status: "Fast" },
  ];

  const securityLogs = [
    { id: 1, event: "Multiple Failed Logins", ip: "45.22.11.90", risk: "High", time: "10 mins ago" },
    { id: 2, event: "New API Key Generated", ip: "Admin-PC", risk: "Medium", time: "1 hour ago" },
    { id: 3, event: "Database Backup Completed", ip: "System", risk: "Low", time: "5 hours ago" },
  ];

  const DynamicTabView = ({ title, description, icon: Icon, children }) => (
    <div className="tab-view fade-in">
      <header className="tab-header">
        <Icon size={32} className="tab-icon" />
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="tab-content">{children}</div>
    </div>
  );

  return (
    <div className={`app-container ${theme}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-area">
          <BarChart3 className="brand-icon" size={28} />
          <h2 className="website-name">CORE ANALYTICS</h2>
        </div>
        <nav className="side-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><LayoutDashboard size={20} /> Overview</button>
          <button className={`nav-item ${activeTab === 'databases' ? 'active' : ''}`} onClick={() => setActiveTab('databases')}><Database size={20} /> Databases</button>
          <button className={`nav-item ${activeTab === 'queries' ? 'active' : ''}`} onClick={() => setActiveTab('queries')}><Zap size={20} /> Queries</button>
          <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}><Shield size={20} /> Security</button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /> Settings</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Good morning, <strong>Admin</strong></h1>
            <p>Manage and monitor your database infrastructure.</p>
          </div>
          <div className="header-controls">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="profile-section" onClick={() => fileInputRef.current.click()}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
              {profilePic ? <img src={profilePic} alt="Profile" className="profile-img" /> : <div className="profile-placeholder"><Upload size={16}/></div>}
              <span className="admin-name">Admin</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="dashboard-view fade-in">
            {/* KPI Cards styled like your new image */}
            <div className="resources-grid">
              <div className="resource-card hover-3d">
                <div className="card-top"><Shield size={16}/> System Health</div>
                <div className="card-body">
                  <div className="big-number">99.9<span>%</span></div>
                  <div className="trend-badge positive">+1% this week</div>
                </div>
              </div>
              <div className="resource-card hover-3d">
                <div className="card-top"><Zap size={16}/> Active Connections</div>
                <div className="card-body">
                  <div className="big-number">1,204</div>
                  <div className="trend-badge positive">+7% last month</div>
                </div>
              </div>
              <div className="resource-card hover-3d">
                <div className="card-top"><LayoutDashboard size={16}/> Avg Query Latency</div>
                <div className="card-body">
                  <div className="big-number">24<span>ms</span></div>
                  <div className="trend-badge negative">-2ms optimized</div>
                </div>
              </div>
            </div>

            {/* Stacked Layout: Table Top, Graph Bottom (Equal Width) */}
            <div className="stacked-grid">
              
              <div className="data-panel hover-3d table-panel">
                <h3>Active Data Streams</h3>
                <div className="scrollable-table" style={{maxHeight: '300px'}}>
                  <table>
                    <thead><tr><th>Order ID</th><th>Customer Name</th><th>Product Stream</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.orders.slice(0, 15).map((order) => (
                        <tr key={order.order_id}>
                          <td className="id-col">#{order.order_id}</td>
                          <td style={{fontWeight: '500'}}>{order.name}</td>
                          <td className="text-muted">{order.product_name}</td>
                          <td><span className="status-badge">Processing</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="data-panel hover-3d">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3>System Performance Trends</h3>
                  <div className="legend">
                    <span className="dot blue"></span> Current <span className="dot red" style={{marginLeft: '10px'}}></span> Previous
                  </div>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData} margin={{top: 20, right: 0, left: -20, bottom: 0}}>
                      <defs>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="time" tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fill: 'var(--text-muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', borderRadius: '10px', color: 'var(--text-main)'}} />
                      {/* Red Line */}
                      <Area type="monotone" dataKey="previous" stroke="#ef4444" strokeWidth={3} fill="none" />
                      {/* Blue/Purple Line */}
                      <Area type="monotone" dataKey="current" stroke="var(--accent)" strokeWidth={3} fill="url(#colorCurrent)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Other Tabs omitted for brevity, keeping same logic as previous step */}
        {activeTab === 'databases' && (
          <DynamicTabView title="Database Schema & Size" description="Overview of tables and counts." icon={Database}>
            <div className="data-panel hover-3d"><div className="scrollable-table"><table><thead><tr><th>Table Name</th><th>Record Count</th></tr></thead><tbody>{data.db_counts.map((db, i) => (<tr key={i}><td className="db-table-name">{db.table_name.toUpperCase()}</td><td className="big-number-small">{db.count.toLocaleString()}</td></tr>))}</tbody></table></div></div>
          </DynamicTabView>
        )}
        {activeTab === 'queries' && (
          <DynamicTabView title="Query Analytics" description="Real-time analysis of execution times." icon={Zap}>
            <div className="data-panel hover-3d"><div className="scrollable-table"><table><thead><tr><th>SQL Statement</th><th>Exec Time</th><th>Status</th></tr></thead><tbody>{recentQueries.map((q) => (<tr key={q.id}><td className="code-font">{q.sql}</td><td>{q.time}</td><td className={`risk-${q.status.toLowerCase()}`}>{q.status}</td></tr>))}</tbody></table></div></div>
          </DynamicTabView>
        )}
        {activeTab === 'security' && (
          <DynamicTabView title="Security Logs" description="Monitor access attempts and alerts." icon={Shield}>
            <div className="data-panel hover-3d"><div className="scrollable-table"><table><thead><tr><th>Event Type</th><th>IP Address</th><th>Risk Level</th></tr></thead><tbody>{securityLogs.map((log) => (<tr key={log.id}><td style={{fontWeight: '500'}}>{log.event}</td><td>{log.ip}</td><td><span className={`risk-${log.risk.toLowerCase()} status-badge`} style={{border: 'none', background: 'none', padding: 0}}>{log.risk}</span></td></tr>))}</tbody></table></div></div>
          </DynamicTabView>
        )}
        {activeTab === 'settings' && (
          <DynamicTabView title="System Settings" description="Configure API endpoints." icon={Settings}>
            <div className="data-panel hover-3d" style={{maxWidth: '600px'}}>
              <div className="settings-form">
                <div className="form-group"><label>Admin Email</label><input type="text" className="premium-input" defaultValue="admin@coreanalytics.com" /></div>
                <button className="settings-btn">Save Configuration</button>
              </div>
            </div>
          </DynamicTabView>
        )}
      </main>
    </div>
  );
}

export default App;