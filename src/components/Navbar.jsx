import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABEL = { patient:'Patient', doctor:'Doctor', admin:'Admin', guest:'Guest' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const a = (p) => pathname === p ? 'active' : '';

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="clinic-navbar">
      <Link to="/" className="brand">
        ✚ Medi<span className="brand-sub">Care</span>
      </Link>

      {user && (
        <ul className="nav-links">
          <li><Link to="/" className={a('/')}>Home</Link></li>
          <li><Link to="/doctors" className={a('/doctors')}>Doctors</Link></li>

          {user.role === 'patient' && <>
            <li><Link to="/appointments" className={a('/appointments')}>My Appointments</Link></li>
            <li><Link to="/book" className={a('/book')}>Book</Link></li>
          </>}
          {user.role === 'doctor' && <>
            <li><Link to="/appointments" className={a('/appointments')}>Appointments</Link></li>
            <li><Link to="/doctor-profile" className={a('/doctor-profile')}>My Profile</Link></li>
          </>}
          {isAdmin && <>
            <li><Link to="/admin" className={a('/admin')}>Dashboard</Link></li>
            <li><Link to="/admin/specialties" className={a('/admin/specialties')}>Specialties</Link></li>
          </>}
        </ul>
      )}

      <div className="d-flex align-items-center gap-2">
        {user ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* Hidden admin panel button — only visible to admin role */}
              {isAdmin && (
                <Link
                  to="/admin"
                  title="Admin Panel"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--red-muted)',
                    border: '1.5px solid var(--red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--red)',
                    textDecoration: 'none',
                    opacity: 0.55,
                    transition: 'opacity 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.55'}
                >
                  ⚙
                </Link>
              )}
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--red-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', border:'2px solid var(--red)', color:'var(--red)', fontWeight:700 }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ lineHeight:1.2 }}>
                <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--dark)' }}>{user.name}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{ROLE_LABEL[user.role]}</div>
              </div>
            </div>
            {user.isGuest
              ? <Link to="/login" className="btn btn-red btn-sm">Sign In</Link>
              : <button className="btn btn-outline-red btn-sm" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
            }
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline-red btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-red btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
