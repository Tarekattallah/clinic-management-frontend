import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllAppointments, getDoctors, getSpecialties } from '../services/api';
import { initParticles } from '../utils/particles';

const SL = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' };
const fmt = (d) => new Date(d).toLocaleString('en-GB',{ day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

export default function AdminPage() {
  const [appts, setAppts]   = useState([]);
  const [docs, setDocs]     = useState([]);
  const [specs, setSpecs]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [filter, setFilter] = useState('all');
  const bgRef  = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('admin-bg', 'light'); }, 60);
    Promise.all([getAllAppointments(), getDoctors(), getSpecialties()])
      .then(([a,d,s])=>{ setAppts(a.data); setDocs(d.data); setSpecs(s.data); })
      .catch(console.error).finally(()=>setLoad(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const filtered = filter==='all' ? appts : appts.filter(a=>a.status===filter);
  const pct = (s) => appts.length ? Math.round(appts.filter(a=>a.status===s).length/appts.length*100) : 0;

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="admin-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div className="hero-section" style={{ marginBottom:'2rem' }}>
          <canvas id="admin-hero-cv" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
          <div className="hero-cross">✚</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="hero-tag">⚙️ Administration</div>
            <h1>Admin <em>Dashboard</em></h1>
            <p>Complete overview of MediCare clinic operations and statistics.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { icon:'📅', n:appts.length, l:'Total Appointments' },
            { icon:'👨‍⚕️', n:docs.length,  l:'Registered Doctors' },
            { icon:'⏳', n:appts.filter(a=>a.status==='pending').length, l:'Pending Review' },
            { icon:'🏥', n:specs.length, l:'Specialties' },
          ].map(({icon,n,l}) => (
            <div className="col-6 col-md-3" key={l}>
              <div className="stat-card">
                <span className="stat-icon">{icon}</span>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="clinic-card p-4">
              <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.3rem', marginBottom:'1rem' }}>Appointment Status Breakdown</h5>
              {['pending','confirmed','completed','cancelled'].map(s => (
                <div key={s} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:'0.82rem', fontWeight:600, textTransform:'capitalize' }}>{s}</span>
                    <span style={{ fontSize:'0.82rem', color:'var(--gray-600)' }}>{appts.filter(a=>a.status===s).length} ({pct(s)}%)</span>
                  </div>
                  <div style={{ background:'var(--gray-100)', borderRadius:4, height:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:4, transition:'width 0.6s', width:`${pct(s)}%`,
                      background: s==='pending'?'#FF8A65': s==='confirmed'?'#66BB6A': s==='completed'?'#42A5F5':'#EF5350' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div style={{ display:'flex', flexDirection:'column', gap:12, height:'100%' }}>
              {[
                { to:'/admin/specialties', icon:'🏥', t:'Manage Specialties', sub:`${specs.length} active`, color:'var(--red)' },
                { to:'/doctors',           icon:'👨‍⚕️', t:'View All Doctors',   sub:`${docs.length} registered`, color:'#1565C0' },
              ].map(({ to,icon,t,sub }) => (
                <Link to={to} key={to} style={{ textDecoration:'none', flex:1 }}>
                  <div className="clinic-card p-4 d-flex align-items-center gap-3" style={{ cursor:'pointer', height:'100%' }}>
                    <div style={{ width:52, height:52, background:'var(--red-muted)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>{icon}</div>
                    <div style={{ flexGrow:1 }}>
                      <div style={{ fontWeight:700, fontSize:'0.92rem', color:'var(--dark)' }}>{t}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--gray-600)', marginTop:2 }}>{sub}</div>
                    </div>
                    <div style={{ color:'var(--red)', fontWeight:700, fontSize:'1.1rem' }}>→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments table */}
        <div className="clinic-card p-4">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.4rem', margin:0 }}>All Appointments</h5>
            <div style={{ display:'flex', gap:6, background:'var(--gray-100)', padding:4, borderRadius:'var(--r-sm)' }}>
              {['all','pending','confirmed','completed','cancelled'].map(s => (
                <button key={s} onClick={()=>setFilter(s)}
                  style={{ border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:'0.75rem', fontFamily:'Outfit, sans-serif', fontWeight:600, transition:'all 0.2s',
                    background: filter===s?'var(--red)':'transparent', color: filter===s?'white':'var(--gray-600)' }}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {filtered.length===0 ? (
            <div className="empty-state"><span className="empty-icon">📅</span><h5>No appointments</h5></div>
          ) : (
            <div className="table-responsive">
              <table className="clinic-table">
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Notes</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a._id}>
                      <td><div style={{ fontWeight:600 }}>{a.patient?.name}</div><div style={{ fontSize:'0.75rem', color:'var(--gray-600)' }}>{a.patient?.email}</div></td>
                      <td style={{ fontWeight:500 }}>{a.doctor?.user?.name||'—'}</td>
                      <td style={{ fontSize:'0.83rem' }}>{fmt(a.dateTime)}</td>
                      <td style={{ maxWidth:160, fontSize:'0.83rem', color:'var(--gray-600)', fontStyle:a.notes?'normal':'italic' }}>{a.notes||'—'}</td>
                      <td><span className={`status-badge status-${a.status}`}>{SL[a.status]||a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
