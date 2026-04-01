import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAppointments, getDoctors, getAllAppointments, getSpecialties } from '../services/api';
import { initParticles } from '../utils/particles';

const SL = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' };
const fmt = (d) => new Date(d).toLocaleString('en-GB',{ day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

const SERVICES = [
  { icon:'❤️', title:'Cardiology',       desc:'Heart & vascular care'           },
  { icon:'🧠', title:'Neurology',        desc:'Brain & nervous system'          },
  { icon:'🦴', title:'Orthopedics',      desc:'Bone, joint & muscle treatment'  },
  { icon:'👁️', title:'Ophthalmology',    desc:'Eye care & vision health'        },
  { icon:'🦷', title:'Dental',           desc:'Oral health & cosmetic dentistry' },
  { icon:'👶', title:'Pediatrics',       desc:'Children\'s health & development' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState({ appts:0, docs:0, pending:0, completed:0 });
  const [recent, setRecent]   = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(!user.isGuest);
  const heroCleanup = useRef(null);
  const bgCleanup   = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => { heroCleanup.current = initParticles('hero-cv', 'dark'); }, 60);
    const t2 = setTimeout(() => { bgCleanup.current   = initParticles('bg-cv', 'light'); }, 80);
    return () => { clearTimeout(t1); clearTimeout(t2); heroCleanup.current?.(); bgCleanup.current?.(); };
  }, []);

  useEffect(() => {
    if (user.isGuest) { getDoctors().then(r => setDoctors(r.data.slice(0,3))).catch(()=>{}); return; }
    const go = async () => {
      try {
        const [aR, dR] = await Promise.all([
          user.role==='admin' ? getAllAppointments() : getAppointments(),
          getDoctors(),
        ]);
        const a = aR.data;
        setStats({ appts:a.length, docs:dR.data.length, pending:a.filter(x=>x.status==='pending').length, completed:a.filter(x=>x.status==='completed').length });
        setRecent(a.slice(0,5));
        setDoctors(dR.data.slice(0,3));
      } catch(e){ console.error(e); } finally { setLoading(false); }
    };
    go();
  }, [user]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      {/* Background particles (white bg) */}
      <canvas id="bg-cv" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.5 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* ── HERO ── */}
        <div className="hero-section">
          <canvas id="hero-cv" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
          <div className="hero-circle" style={{ width:300, height:300, top:-100, right:-80 }}/>
          <div className="hero-circle" style={{ width:160, height:160, bottom:-60, right:200 }}/>
          <div className="hero-cross">✚</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="hero-tag">🏥 {user.isGuest ? 'Welcome to MediCare' : `${user.role.charAt(0).toUpperCase()+user.role.slice(1)} Dashboard`}</div>
            <h1>
              {user.isGuest && <>Your health,<br/><em>starts here.</em></>}
              {user.role==='patient' && <>Welcome back,<br/><em>{user.name.split(' ')[0]}.</em></>}
              {user.role==='doctor'  && <>Good to see you,<br/>Dr. <em>{user.name.split(' ')[0]}.</em></>}
              {user.role==='admin'   && <>Clinic<br/><em>Dashboard.</em></>}
            </h1>
            <p>
              {user.isGuest    && 'Browse specialist doctors and services. Sign in to book your first appointment.'}
              {user.role==='patient' && 'Manage your appointments, medical records, and connect with top physicians.'}
              {user.role==='doctor'  && 'View your schedule, update your profile, and add medical records for patients.'}
              {user.role==='admin'   && 'Monitor clinic activity, manage specialties, and oversee all appointments.'}
            </p>
            <div style={{ display:'flex', gap:12, marginTop:24, flexWrap:'wrap' }}>
              {user.role==='patient' && <Link to="/book" className="btn btn-ghost">+ Book Appointment</Link>}
              {user.isGuest          && <Link to="/login" className="btn btn-ghost">Sign In to Book</Link>}
              <Link to="/doctors" className="btn btn-ghost">View All Doctors →</Link>
            </div>
          </div>
        </div>

        {/* ── STATS (logged-in only) ── */}
        {!user.isGuest && (
          <div className="row g-3 mb-4">
            {[
              { icon:'📅', n:stats.appts,     l:'Total Appointments' },
              { icon:'👨‍⚕️', n:stats.docs,      l:'Available Doctors'  },
              { icon:'⏳', n:stats.pending,   l:'Pending'            },
              { icon:'✅', n:stats.completed, l:'Completed'          },
            ].map(({ icon,n,l }) => (
              <div className="col-6 col-md-3" key={l}>
                <div className="stat-card">
                  <span className="stat-icon">{icon}</span>
                  <div className="stat-number">{n}</div>
                  <div className="stat-label">{l}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SERVICES GRID ── */}
        <div style={{ marginBottom:'2.5rem' }}>
          <div className="section-header">
            <h4>Our Specialties</h4>
            <div className="red-rule"/>
            <p>World-class care across a wide range of medical disciplines</p>
          </div>
          <div className="row g-3">
            {SERVICES.map(s => (
              <div className="col-6 col-md-4 col-lg-2" key={s.title}>
                <div className="feature-card" style={{ textAlign:'center', cursor:'default' }}>
                  <div className="fc-icon" style={{ margin:'0 auto 10px' }}>{s.icon}</div>
                  <div style={{ fontWeight:700, fontSize:'0.82rem', color:'var(--dark)' }}>{s.title}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-600)', marginTop:4 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURED DOCTORS ── */}
        {doctors.length > 0 && (
          <div style={{ marginBottom:'2.5rem' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h4 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.6rem' }}>Featured Doctors</h4>
                <div className="red-rule"/>
              </div>
              <Link to="/doctors" className="btn btn-outline-red btn-sm">View All →</Link>
            </div>
            <div className="row g-4">
              {doctors.map(doc => (
                <div className="col-12 col-md-4" key={doc._id}>
                  <div className="doctor-card" style={{ position:'relative' }}>
                    <div className="doc-banner"/>
                    <div className="doc-avatar">👨‍⚕️</div>
                    <div className="doc-body">
                      <div className="doc-name">Dr. {doc.user?.name}</div>
                      <div className="doc-email">{doc.user?.email}</div>
                      {doc.experienceYears>0 && <div style={{ fontSize:'0.78rem', color:'var(--gray-600)', marginTop:8 }}>⏱ {doc.experienceYears} years experience</div>}
                      {doc.specialties?.length>0 && <div style={{ marginTop:8 }}>{doc.specialties.map(s=><span key={s._id} className="specialty-tag">{s.name}</span>)}</div>}
                      <div style={{ marginTop:14 }}>
                        {user.role==='patient'
                          ? <Link to="/book" state={{ doctorId:doc._id }} className="btn btn-red btn-sm w-100">Book Now</Link>
                          : <Link to="/doctors" className="btn btn-outline-red btn-sm w-100">View Profile</Link>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECENT APPOINTMENTS ── */}
        {!user.isGuest && recent.length>0 && (
          <div className="clinic-card p-4" style={{ marginBottom:'2rem' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.4rem', margin:0 }}>Recent Appointments</h5>
                <div className="red-rule"/>
              </div>
              <Link to="/appointments" className="btn btn-outline-red btn-sm">View All →</Link>
            </div>
            <div className="table-responsive">
              <table className="clinic-table">
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.map(a => (
                    <tr key={a._id}>
                      <td><strong>{a.patient?.name||'—'}</strong></td>
                      <td>{a.doctor?.user?.name||'—'}</td>
                      <td style={{ fontSize:'0.83rem' }}>{fmt(a.dateTime)}</td>
                      <td><span className={`status-badge status-${a.status}`}>{SL[a.status]||a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CTA BANNER ── */}
        <div className="info-strip">
          <canvas id="cta-cv" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', borderRadius:'var(--r-lg)' }}/>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.5rem', color:'white', fontWeight:600 }}>Ready to take control of your health?</div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.88rem', marginTop:4 }}>Join thousands of patients already using MediCare.</div>
          </div>
          <div style={{ position:'relative', zIndex:1 }}>
            {user.isGuest
              ? <Link to="/register" className="btn" style={{ background:'white', color:'var(--red)', fontWeight:700, borderRadius:'var(--r-md)', padding:'12px 28px' }}>Get Started Free →</Link>
              : <Link to={user.role==='patient' ? '/book' : '/doctors'} className="btn" style={{ background:'white', color:'var(--red)', fontWeight:700, borderRadius:'var(--r-md)', padding:'12px 28px' }}>
                  {user.role==='patient' ? 'Book Now →' : 'View Doctors →'}
                </Link>}
          </div>
        </div>

      </div>
    </div>
  );
}
