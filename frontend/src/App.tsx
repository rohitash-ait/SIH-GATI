import type { FormEvent, ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useParams } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CircleHelp,
  Inbox,
  LogOut,
  MapPinned,
  Menu,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCircle2,
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

type Role = 'APPLICANT' | 'OFFICER' | 'ADMIN';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  district?: string;
  businessName?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
};

type Approval = {
  id: string;
  name: string;
  department: string;
  category: string;
  why: string;
  processingTime: string;
  sla: string;
  fee: string;
  validity: string;
  prerequisites: string[];
  requiredDocuments: string[];
  dependency: string;
  status: string;
  description: string;
  whoNeedsIt: string;
  eligibility: string;
  renewalFrequency: string;
  processSteps: string[];
  dependencies: string[];
};

const demoUsers = [
  { email: 'applicant@gati.demo', password: 'password123', role: 'APPLICANT' as const },
  { email: 'officer@gati.demo', password: 'password123', role: 'OFFICER' as const },
  { email: 'admin@gati.demo', password: 'password123', role: 'ADMIN' as const },
];

const processSteps = ['Profile', 'Discover', 'Prepare', 'Apply', 'Track', 'Complete', 'Renew'];

const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

type AuthContextValue = {
  user: User | null | undefined;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('gati_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch<{ user: User }>('/me');
      setUser(response.user);
    } catch {
      localStorage.removeItem('gati_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (token: string, nextUser: User) => {
    localStorage.setItem('gati_token', token);
    setUser(nextUser);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('gati_token');
    setUser(null);
    setLoading(false);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gati_token');
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Request failed');
  }

  return (await response.json()) as T;
}

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container nav-row">
          <div className="brand-block compact-brand">
            <div className="brand-icon"><MapPinned size={18} /></div>
            <div>
              <div className="brand-name">GATI</div>
              <div className="brand-tag">Government Approval &amp; Incentive Tracking Interface</div>
            </div>
          </div>
          <nav className="landing-nav">
            <a href="#how">How GATI Works</a>
            <a href="#why">Why GATI</a>
            <a href="#about">About</a>
            <Link to="/login">Login</Link>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="map-overlay" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Government digital service</span>
            <h1>Start Your Business Journey With GATI</h1>
            <p>Discover approvals, prepare documents, track applications and access government incentives through one simple platform.</p>
            <div className="cta-row">
              <Link to="/login" className="primary-btn">Get Started</Link>
              <a href="#how" className="secondary-btn">Explore How GATI Works</a>
            </div>
          </div>

          <div className="hero-card">
            <div className="mini-stat"><ShieldCheck size={16} /> Trusted approvals</div>
            <div className="mini-stat"><TrendingUp size={16} /> 68% project readiness</div>
            <div className="mini-stat"><BriefcaseBusiness size={16} /> 7 approval steps</div>
            <div className="hero-progress">
              <div className="progress-row"><span>Project readiness</span><strong>68%</strong></div>
              <div className="progress-bar"><span style={{ width: '68%' }} /></div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-strip">One platform for business approvals, compliance and incentives.</div>

      <section id="how" className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">How GATI Helps</span>
          <h2>Everything entrepreneurs need in one place</h2>
        </div>
        <div className="feature-grid">
          {['Build Your Project Profile', 'Discover Required Approvals', 'Prepare Your Documents', 'Submit Applications', 'Track Progress', 'Manage Renewals', 'Discover Incentives'].map((label, index) => (
            <div key={label} className="feature-card">
              <div className="feature-index">0{index + 1}</div>
              <h3>{label}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">Why GATI?</span>
          <h2>Guided, transparent and ready for action</h2>
        </div>
        <div className="bullet-grid">
          {['Personalized approval discovery', 'Document readiness', 'Application tracking', 'Query management', 'Renewal reminders', 'Incentive discovery'].map((item) => (
            <div key={item} className="bullet-item"><CheckCircle2 size={18} /> {item}</div>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">How It Works</span>
          <h2>Your approval journey, mapped clearly</h2>
        </div>
        <div className="process-flow">
          {processSteps.map((step, index) => (
            <div key={step} className="process-step">
              <span>0{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <footer id="about" className="container footer-box">
        <div className="brand-block compact-brand">
          <div className="brand-icon"><MapPinned size={18} /></div>
          <div>
            <div className="brand-name">GATI</div>
          </div>
        </div>
        <div className="footer-links">
          <a href="#about">About Gati</a>
          <a href="#">Help</a>
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Accessibility</a>
          <a href="#">Feedback</a>
        </div>
      </footer>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Incorrect email or password');
      login(body.token, body.user);
      const destination = body.user.role === 'APPLICANT' ? '/dashboard' : body.user.role === 'OFFICER' ? '/officer' : '/admin';
      window.location.href = destination;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  const doDemoLogin = async (role: Role) => {
    const demoUser = demoUsers.find((entry) => entry.role === role)!;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoUser.email, password: demoUser.password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Login failed');
      login(body.token, body.user);
      const destination = role === 'APPLICANT' ? '/dashboard' : role === 'OFFICER' ? '/officer' : '/admin';
      window.location.href = destination;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <div className="map-overlay auth-map" aria-hidden="true" />
        <div className="auth-brand">
          <div className="brand-block compact-brand">
            <div className="brand-icon"><MapPinned size={18} /></div>
            <div>
              <div className="brand-name">GATI</div>
              <div className="brand-tag">Government Approval &amp; Incentive Tracking Interface</div>
            </div>
          </div>
          <p>One platform connecting entrepreneurs with government services across Maharashtra.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="login-card">
          <span className="eyebrow">Welcome</span>
          <h2>Sign in to your GATI account</h2>
          {error ? <div className="alert error">{error}</div> : null}

          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              <span>Email / Mobile</span>
              <input type="text" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="applicant@gati.demo" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="password123" />
            </label>

            <div className="row-between">
              <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
              <a href="#" className="text-link">Forgot Password</a>
            </div>
          </form>

          <div className="demo-box">
            <p>Demo Login</p>
            <div className="demo-row">
              <button type="button" className="secondary-btn" onClick={() => doDemoLogin('APPLICANT')} disabled={loading}>Applicant</button>
              <button type="button" className="secondary-btn" onClick={() => doDemoLogin('OFFICER')} disabled={loading}>Officer</button>
              <button type="button" className="secondary-btn" onClick={() => doDemoLogin('ADMIN')} disabled={loading}>Admin</button>
            </div>
          </div>

          <p className="switch-link">Need an account? <Link to="/register">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: 'Manufacturing',
    district: 'Pune',
    taluka: 'Haveli',
    termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fullName || !form.mobileNumber || !form.email || !form.password || !form.confirmPassword || !form.businessName) {
      setError('Please complete all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^\d{10}$/.test(form.mobileNumber)) {
      setError('Please enter a valid mobile number.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.termsAccepted) {
      setError('Please agree to the terms and privacy policy.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          mobileNumber: form.mobileNumber,
          email: form.email,
          password: form.password,
          businessName: form.businessName,
          businessType: form.businessType,
          district: form.district,
          taluka: form.taluka,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Registration failed');
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="auth-layout auth-register">
      <div className="auth-panel full-panel">
        <div className="login-card wide-card">
          <span className="eyebrow">Create account</span>
          <h2>Register for GATI</h2>
          {error ? <div className="alert error">{error}</div> : null}
          {success ? <div className="alert success">{success}</div> : null}

          <form className="stack-form multi-column" onSubmit={handleSubmit}>
            <label><span>Full Name</span><input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></label>
            <label><span>Mobile Number</span><input value={form.mobileNumber} onChange={(event) => setForm((current) => ({ ...current, mobileNumber: event.target.value }))} /></label>
            <label><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label><span>Business Name</span><input value={form.businessName} onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))} /></label>
            <label><span>Password</span><input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /></label>
            <label><span>Confirm Password</span><input type="password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} /></label>
            <label><span>Business Type</span><select value={form.businessType} onChange={(event) => setForm((current) => ({ ...current, businessType: event.target.value }))}><option>Manufacturing</option><option>Service</option><option>Trading</option><option>Agri-business</option></select></label>
            <label><span>District</span><select value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}><option>Pune</option><option>Mumbai</option><option>Nashik</option><option>Nagpur</option></select></label>
            <label><span>Taluka</span><select value={form.taluka} onChange={(event) => setForm((current) => ({ ...current, taluka: event.target.value }))}><option>Haveli</option><option>Mulshi</option><option>Bhor</option><option>Karjat</option></select></label>

            <label className="checkbox-field full-width">
              <input type="checkbox" checked={form.termsAccepted} onChange={(event) => setForm((current) => ({ ...current, termsAccepted: event.target.checked }))} />
              <span>I agree to the terms and privacy policy.</span>
            </label>

            <button type="submit" className="primary-btn full-width">Create GATI Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('gati_token');
    if (!token) {
      setUser(null);
      return;
    }

    apiFetch<{ user: User }>('/me')
      .then((response) => setUser(response.user))
      .catch(() => {
        localStorage.removeItem('gati_token');
        setUser(null);
      });
  }, []);

  const navItems = useMemo(() => {
    if (!user) return [];

    if (user.role === 'APPLICANT') {
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Project', to: '/project' },
        { label: 'Approvals', to: '/approvals/discover' },
        { label: 'Roadmap', to: '/approvals/roadmap' },
        { label: 'Documents', to: '/documents' },
        { label: 'Applications', to: '/applications' },
        { label: 'Queries', to: '/queries' },
        { label: 'Schemes', to: '/schemes' },
        { label: 'Renewals', to: '/renewals' },
        { label: 'Compliance', to: '/compliance' },
        { label: 'Notifications', to: '/notifications' },
      ];
    }

    if (user.role === 'OFFICER') {
      return [
        { label: 'Dashboard', to: '/officer' },
        { label: 'Applications', to: '/officer' },
        { label: 'Queries', to: '/queries' },
        { label: 'SLA', to: '/officer' },
        { label: 'Analytics', to: '/officer' },
        { label: 'Audit', to: '/audit' },
      ];
    }

    return [
      { label: 'Dashboard', to: '/admin' },
      { label: 'Users', to: '/admin' },
      { label: 'Projects', to: '/admin' },
      { label: 'Approvals', to: '/admin' },
      { label: 'Schemes', to: '/admin' },
      { label: 'Audit', to: '/audit' },
    ];
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('gati_token');
    window.location.href = '/login';
  };

  if (user === undefined) {
    return <PageLoader />;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <button type="button" className="menu-button" aria-label="Toggle navigation" onClick={() => setMobileOpen((value) => !value)}>
            <Menu size={18} />
          </button>
          <div className="brand-icon"><MapPinned size={18} /></div>
          <div>
            <div className="brand-name">GATI</div>
            <div className="brand-tag">Government Approval &amp; Incentive Tracking Interface</div>
          </div>
        </div>

        <nav className={cn('topnav', mobileOpen && 'open')}>
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => cn('nav-link', isActive && 'active')} end>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="top-actions">
          <div className="search-box">
            <Search size={15} />
            <input aria-label="Search" placeholder="Search approvals..." />
          </div>
          <button type="button" className="icon-button" aria-label="Notifications">
            <Bell size={16} />
            <span className="dot-badge">3</span>
          </button>
          <button type="button" className="icon-button" aria-label="Help">
            <CircleHelp size={16} />
          </button>
          <div className="profile-pill">
            <UserCircle2 size={20} />
            <span>{user.name}</span>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}><LogOut size={15} /> Logout</button>
        </div>
      </header>

      <main className="page-body">{children}</main>
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: { name: string; role: string }; project: { name: string; location: string; readiness: number }; overview: any; nextSteps: any[]; timeline: string[]; schemes: any[]; notifications: NotificationItem[] }>('/dashboard')
      .then((payload) => setData(payload))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <EmptyState title="No dashboard data available" caption="The dashboard service is not responding." buttonLabel="Refresh" action={() => window.location.reload()} />;

  return (
    <div className="page-shell">
      <section className="card page-hero">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>{data.user.name}</h1>
        </div>
        <button type="button" className="secondary-btn">Download Summary</button>
      </section>

      <section className="summary-grid">
        <div className="card summary-card large-summary">
          <div className="card-header">
            <h3>Project status</h3>
            <span className="status-pill success">On track</span>
          </div>
          <div className="project-name">{data.project.name}</div>
          <p className="muted">Location: {data.project.location}</p>
          <div className="progress-row"><span>Overall readiness</span><strong>{data.project.readiness}%</strong></div>
          <div className="progress-bar"><span style={{ width: `${data.project.readiness}%` }} /></div>
        </div>

        <div className="card summary-card">
          <div className="card-header"><h3>Your Next Steps</h3></div>
          <div className="stack-list">
            {data.nextSteps.map((step: any) => (
              <div key={step.title} className="list-item-row">
                <span>{step.title}</span>
                <button type="button" className="tiny-btn">{step.action}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stat-grid">
        {[
          { label: 'Total approvals', value: data.overview.totalApprovals },
          { label: 'Completed', value: data.overview.completed },
          { label: 'In progress', value: data.overview.inProgress },
          { label: 'Action required', value: data.overview.actionRequired },
          { label: 'Upcoming renewals', value: data.overview.upcomingRenewals },
        ].map((item) => (
          <div key={item.label} className="card stat-card">
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </div>
        ))}
      </section>

      <section className="two-col">
        <div className="card">
          <div className="card-header"><h3>Application timeline</h3></div>
          <ul className="timeline-list">
            {data.timeline.map((step: string) => (
              <li key={step}><span className="timeline-dot" />{step}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recommended schemes</h3></div>
          <div className="scheme-list">
            {data.schemes.map((scheme: any) => (
              <div key={scheme.id} className="mini-scheme">
                <div><strong>{scheme.name}</strong><span>{scheme.incentiveType}</span></div>
                <CheckCircle2 size={16} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card notifications-panel">
        <div className="card-header"><h3>Notifications</h3></div>
        <div className="stack-list">
          {data.notifications.map((item: NotificationItem) => (
            <div key={item.id} className="list-item-row status-row">
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
              </div>
              {!item.read ? <span className="status-pill neutral">New</span> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProjectPage() {
  const [project, setProject] = useState<any>(null);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    apiFetch<{ project: any; completion: number }>('/project')
      .then((payload) => {
        setProject(payload.project);
        setCompletion(payload.completion || 0);
      })
      .catch(() => setProject(null));
  }, []);

  if (!project) return <PageLoader />;

  return (
    <div className="page-shell">
      <section className="card page-hero">
        <div>
          <span className="eyebrow">Project profile</span>
          <h1>Let’s set up your project</h1>
        </div>
        <div className="progress-box">
          <span>Profile completion</span>
          <strong>{completion}%</strong>
        </div>
      </section>

      <div className="card progress-wrap">
        <div className="progress-bar"><span style={{ width: `${completion}%` }} /></div>
      </div>

      <div className="card form-card">
        <div className="form-grid">
          <label><span>Business Name</span><input defaultValue={project.businessName} /></label>
          <label><span>Business Type</span><input defaultValue={project.businessType} /></label>
          <label><span>Entity Type</span><input defaultValue={project.entityType} /></label>
          <label><span>Industry</span><input defaultValue={project.industry} /></label>
          <label><span>District</span><input defaultValue={project.district} /></label>
          <label><span>Taluka</span><input defaultValue={project.taluka} /></label>
          <label><span>Village / City</span><input defaultValue={project.city} /></label>
          <label><span>PIN</span><input defaultValue={project.pin} /></label>
          <label className="full-width"><span>Project Description</span><textarea defaultValue={project.projectDescription} rows={4} /></label>
          <label><span>Total Investment</span><input defaultValue={project.totalInvestment} /></label>
          <label><span>Direct Employment</span><input defaultValue={project.directEmployment} /></label>
        </div>

        <div className="action-row">
          <button type="button" className="secondary-btn">Save Draft</button>
          <button type="button" className="primary-btn">Complete Profile</button>
        </div>
      </div>
    </div>
  );
}

function DiscoverApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);

  useEffect(() => {
    apiFetch<{ approvals: Approval[] }>('/approvals')
      .then((payload) => setApprovals(payload.approvals))
      .catch(() => setApprovals([]));
  }, []);

  return (
    <div className="page-shell">
      <section className="card page-hero">
        <div>
          <span className="eyebrow">Approvals identified</span>
          <h1>Approvals Identified For Your Project</h1>
        </div>
      </section>

      <div className="approval-grid">
        {approvals.map((approval) => (
          <div key={approval.id} className="card approval-card">
            <div className="card-header">
              <h3>{approval.name}</h3>
              <span className="status-pill warning">{approval.status}</span>
            </div>
            <p className="muted">{approval.department}</p>
            <p>{approval.why}</p>
            <ul className="meta-list">
              <li><strong>Estimated time:</strong> {approval.processingTime}</li>
              <li><strong>SLA:</strong> {approval.sla}</li>
              <li><strong>Fee:</strong> {approval.fee}</li>
              <li><strong>Validity:</strong> {approval.validity}</li>
            </ul>
            <div className="action-row compact-row">
              <Link to={`/approvals/${approval.id}`} className="secondary-btn">View Details</Link>
              <button type="button" className="primary-btn">Start Application</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalDetailPage() {
  const { id: approvalId } = useParams();
  const [approval, setApproval] = useState<Approval | null>(null);

  useEffect(() => {
    if (!approvalId) return;
    apiFetch<{ approval: Approval }>(`/approvals/${approvalId}`)
      .then((payload) => setApproval(payload.approval))
      .catch(() => setApproval(null));
  }, [approvalId]);

  if (!approval) return <PageLoader />;

  return (
    <div className="page-shell">
      <section className="card page-hero detail-hero">
        <div>
          <span className="eyebrow">Approval detail</span>
          <h1>{approval.name}</h1>
          <p>{approval.department}</p>
        </div>
        <div className="action-row">
          <button type="button" className="primary-btn">Start Application</button>
          <button type="button" className="secondary-btn">Download Checklist</button>
        </div>
      </section>

      <div className="two-col">
        <div className="card detail-panel">
          <h3>Description</h3>
          <p>{approval.description}</p>
          <h3>Why you need it</h3>
          <p>{approval.why}</p>
        </div>

        <div className="card detail-panel">
          <h3>Required documents</h3>
          <ul className="check-list">
            {approval.requiredDocuments.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    apiFetch<{ documents: any[]; summary: any }>('/documents')
      .then((payload) => {
        setDocuments(payload.documents);
        setSummary(payload.summary);
      })
      .catch(() => {
        setDocuments([]);
        setSummary({});
      });
  }, []);

  return (
    <div className="page-shell">
      <section className="card page-hero">
        <div>
          <span className="eyebrow">Document center</span>
          <h1>Documents</h1>
        </div>
      </section>

      <section className="stat-grid">
        {[
          { label: 'Documents required', value: summary.required || 0 },
          { label: 'Documents uploaded', value: summary.uploaded || 0 },
          { label: 'Verified', value: summary.verified || 0 },
          { label: 'Missing', value: summary.missing || 0 },
          { label: 'Expiring', value: summary.expiring || 0 },
        ].map((item) => (
          <div key={item.label} className="card stat-card"><p>{item.label}</p><h3>{item.value}</h3></div>
        ))}
      </section>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Approval</th>
              <th>Status</th>
              <th>Uploaded Date</th>
              <th>Validation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.approval}</td>
                <td>{doc.status}</td>
                <td>{doc.uploadedDate}</td>
                <td>{doc.validation}</td>
                <td><button type="button" className="secondary-btn small">Upload</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<{ applications: any[] }>('/applications')
      .then((payload) => setItems(payload.applications))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Applications</span><h1>Application tracking</h1></div></section>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Approval</th>
              <th>Department</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.approval}</td>
                <td>{item.department}</td>
                <td>{item.submittedDate}</td>
                <td>{item.status}</td>
                <td>{item.lastUpdated}</td>
                <td>{item.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchemesPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<{ schemes: any[] }>('/schemes')
      .then((payload) => setItems(payload.schemes))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Schemes</span><h1>Recommended For Your Project</h1></div></section>
      <div className="approval-grid">
        {items.map((scheme) => (
          <div key={scheme.id} className="card approval-card">
            <div className="card-header">
              <h3>{scheme.name}</h3>
              <span className="status-pill success">{scheme.status}</span>
            </div>
            <p className="muted">{scheme.department}</p>
            <ul className="meta-list">
              <li><strong>Eligibility:</strong> {scheme.eligibility}</li>
              <li><strong>Sector:</strong> {scheme.sector}</li>
              <li><strong>Location:</strong> {scheme.location}</li>
              <li><strong>Incentive:</strong> {scheme.incentiveType}</li>
            </ul>
            <div className="action-row compact-row">
              <button type="button" className="secondary-btn">View Details</button>
              <button type="button" className="primary-btn">Check Eligibility</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RenewalsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<{ renewals: any[] }>('/renewals')
      .then((payload) => setItems(payload.renewals))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Renewals</span><h1>Renewal calendar</h1></div></section>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Approval</th>
              <th>Expiry Date</th>
              <th>Days Remaining</th>
              <th>Renewal Status</th>
              <th>Last Renewed</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}><td>{item.approval}</td><td>{item.expiryDate}</td><td>{item.daysRemaining}</td><td>{item.status}</td><td>{item.lastRenewed}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    apiFetch<{ notifications: NotificationItem[] }>('/notifications')
      .then((payload) => setItems(payload.notifications))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Notifications</span><h1>Updates and reminders</h1></div></section>
      <div className="card stack-list">
        {items.map((item) => (
          <div key={item.id} className="list-item-row status-row">
            <div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
            </div>
            {!item.read ? <span className="status-pill neutral">New</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapPage() {
  const roadmap = [
    { id: 'land', name: 'Land Approval', status: 'Completed', dept: 'Revenue', time: '10 days', blocked: false },
    { id: 'building', name: 'Building Plan', status: 'In Progress', dept: 'Local Authority', time: '18 days', blocked: false },
    { id: 'pollution', name: 'Pollution NOC', status: 'Upcoming', dept: 'MPCB', time: '22 days', blocked: false },
    { id: 'fire', name: 'Fire NOC', status: 'Blocked', dept: 'Fire Dept', time: '14 days', blocked: true },
    { id: 'factory', name: 'Factory License', status: 'Upcoming', dept: 'Industries', time: '30 days', blocked: false },
  ];

  return (
    <div className="page-shell">
      <section className="card page-hero">
        <div>
          <span className="eyebrow">Dependency roadmap</span>
          <h1>Approval roadmap</h1>
        </div>
      </section>

      <div className="card roadmap-wrap">
        <div className="roadmap-graph">
          {roadmap.map((item, index) => (
            <div key={item.id} className="roadmap-node">
              <div className="node-badge">{item.status}</div>
              <strong>{item.name}</strong>
              <small>{item.dept}</small>
              <span>{item.time}</span>
              {index < roadmap.length - 1 ? <div className="roadmap-arrow">↓</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentValidationPage() {
  return (
    <div className="page-shell">
      <section className="card page-hero">
        <div><span className="eyebrow">AI document pre-validation</span><h1>Document validation</h1></div>
      </section>
      <div className="two-col">
        <div className="card detail-panel">
          <h3>OCR / extracted fields</h3>
          <ul className="check-list">
            <li>✓ PAN / Name Match</li>
            <li>✓ Signature Present</li>
            <li>✓ Expiry Valid</li>
            <li>✓ Required Fields Present</li>
            <li>✓ Document Type Correct</li>
          </ul>
        </div>
        <div className="card detail-panel">
          <h3>Issues found</h3>
          <p>No critical issues. Document passes the prototype validation rules.</p>
          <div className="action-row">
            <button type="button" className="primary-btn">Correct &amp; Re-upload</button>
            <button type="button" className="secondary-btn">Submit for review</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueriesPage() {
  const [queries] = useState([
    { id: 'Q-104', title: 'Query from Officer', question: 'Submit revised occupancy documentation.', dueDate: '2026-09-30', status: 'Action required' },
    { id: 'Q-119', title: 'Follow-up', question: 'Clarify land-use classification for Building Plan.', dueDate: '2026-10-03', status: 'Awaiting response' },
  ]);

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Query resolution</span><h1>Queries</h1></div></section>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Query ID</th><th>Title</th><th>Question</th><th>Due date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {queries.map((query) => (
              <tr key={query.id}><td>{query.id}</td><td>{query.title}</td><td>{query.question}</td><td>{query.dueDate}</td><td>{query.status}</td><td><button type="button" className="secondary-btn small">Respond</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplianceCalendarPage() {
  const events = [
    { id: 'evt-1', name: 'Factory License renewal', date: '2026-11-30', status: 'Upcoming' },
    { id: 'evt-2', name: 'Fire NOC expiry review', date: '2026-10-15', status: 'Due Soon' },
    { id: 'evt-3', name: 'Document expiry alert', date: '2026-09-28', status: 'Attention' },
  ];

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Compliance calendar</span><h1>Renewal and deadline tracking</h1></div></section>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}><td>{event.name}</td><td>{event.date}</td><td>{event.status}</td><td><button type="button" className="secondary-btn small">Open</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditPage() {
  const entries = [
    { id: 'A-1', action: 'Project profile created', user: 'Aarav Patil', timestamp: '2026-09-16', status: 'Created' },
    { id: 'A-2', action: 'Document uploaded', user: 'Aarav Patil', timestamp: '2026-09-17', status: 'Verified' },
    { id: 'A-3', action: 'Application submitted', user: 'Aarav Patil', timestamp: '2026-09-18', status: 'Submitted' },
  ];

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Audit trail</span><h1>Feedback &amp; audit</h1></div></section>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Action</th><th>User</th><th>Timestamp</th><th>Status</th></tr></thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}><td>{entry.action}</td><td>{entry.user}</td><td>{entry.timestamp}</td><td>{entry.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfficerDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch<{ dashboard: any; applications: any[] }>('/officer/dashboard')
      .then((payload) => setData(payload))
      .catch(() => setData({ dashboard: { applicationsReceived: 0, pendingVerification: 0, queriesPending: 0, approved: 0, rejected: 0, slaBreaches: 0 }, applications: [] }));
  }, []);

  if (!data) return <PageLoader />;

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Officer dashboard</span><h1>Applications Received</h1></div></section>
      <section className="stat-grid">
        {[
          { label: 'Applications Received', value: data.dashboard.applicationsReceived },
          { label: 'Pending Verification', value: data.dashboard.pendingVerification },
          { label: 'Queries Pending', value: data.dashboard.queriesPending },
          { label: 'Approved', value: data.dashboard.approved },
          { label: 'Rejected', value: data.dashboard.rejected },
          { label: 'SLA Breaches', value: data.dashboard.slaBreaches },
        ].map((item) => (
          <div key={item.label} className="card stat-card"><p>{item.label}</p><h3>{item.value}</h3></div>
        ))}
      </section>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>Application ID</th><th>Applicant</th><th>Approval</th><th>Submitted</th><th>SLA</th><th>Status</th></tr></thead>
          <tbody>
            {data.applications.map((item: any) => (
              <tr key={item.id}><td>{item.id}</td><td>{item.userId}</td><td>{item.approval}</td><td>{item.submittedDate}</td><td>{item.sla}</td><td>{item.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch<{ dashboard: any; audit: any[] }>('/admin/dashboard')
      .then((payload) => setData(payload))
      .catch(() => setData({ dashboard: { users: 0, applicants: 0, officers: 0, projects: 0, applications: 0, approvals: 0, schemes: 0, documents: 0 }, audit: [] }));
  }, []);

  if (!data) return <PageLoader />;

  return (
    <div className="page-shell">
      <section className="card page-hero"><div><span className="eyebrow">Admin dashboard</span><h1>System overview</h1></div></section>
      <section className="stat-grid">
        {[
          { label: 'Users', value: data.dashboard.users },
          { label: 'Applicants', value: data.dashboard.applicants },
          { label: 'Officers', value: data.dashboard.officers },
          { label: 'Projects', value: data.dashboard.projects },
          { label: 'Applications', value: data.dashboard.applications },
          { label: 'Approvals', value: data.dashboard.approvals },
          { label: 'Schemes', value: data.dashboard.schemes },
          { label: 'Documents', value: data.dashboard.documents },
        ].map((item) => (
          <div key={item.label} className="card stat-card"><p>{item.label}</p><h3>{item.value}</h3></div>
        ))}
      </section>
    </div>
  );
}

function EmptyState({ title, caption, buttonLabel, action }: { title: string; caption: string; buttonLabel?: string; action?: () => void }) {
  return (
    <div className="card empty-state">
      <Inbox size={32} />
      <h3>{title}</h3>
      <p>{caption}</p>
      {buttonLabel ? <button type="button" className="primary-btn" onClick={action}>{buttonLabel}</button> : null}
    </div>
  );
}

function PageLoader() {
  return (
    <div className="loader-wrap">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('gati_token');

  if (loading) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={token || user ? <Navigate to={user?.role === 'OFFICER' ? '/officer' : user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
        <Route path="/project" element={<AppShell><ProjectPage /></AppShell>} />
        <Route path="/approvals/discover" element={<AppShell><DiscoverApprovalsPage /></AppShell>} />
        <Route path="/approvals/roadmap" element={<AppShell><RoadmapPage /></AppShell>} />
        <Route path="/approvals/:id" element={<AppShell><ApprovalDetailPage /></AppShell>} />
        <Route path="/documents" element={<AppShell><DocumentsPage /></AppShell>} />
        <Route path="/documents/validation" element={<AppShell><DocumentValidationPage /></AppShell>} />
        <Route path="/applications" element={<AppShell><ApplicationsPage /></AppShell>} />
        <Route path="/queries" element={<AppShell><QueriesPage /></AppShell>} />
        <Route path="/schemes" element={<AppShell><SchemesPage /></AppShell>} />
        <Route path="/renewals" element={<AppShell><RenewalsPage /></AppShell>} />
        <Route path="/compliance" element={<AppShell><ComplianceCalendarPage /></AppShell>} />
        <Route path="/notifications" element={<AppShell><NotificationsPage /></AppShell>} />
        <Route path="/audit" element={<AppShell><AuditPage /></AppShell>} />
        <Route path="/officer" element={<AppShell><OfficerDashboardPage /></AppShell>} />
        <Route path="/admin" element={<AppShell><AdminDashboardPage /></AppShell>} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
