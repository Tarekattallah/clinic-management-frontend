import { useEffect, useState, useRef } from 'react';
import { getAppointments, getAllAppointments } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddMedicalRecord from '../components/AddMedicalRecord';
import { initParticles } from '../utils/particles';

const SL = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' };
const fmt = (d) => new Date(d).toLocaleString('en-GB',{ day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter,  setFilter]      = useState('all');
  const [selected, setSelected]   = useState(null);
  const { user } = useAuth();
  const bgRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('appt-bg', 'light'); }, 60);
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const fetchAll = async () => {
    try {
      const r = user.role==='admin' ? await getAllAppointments() : await getAppointments();
      setAppointments(r.data);
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const tabs = ['all','pending','confirmed','completed','cancelled'];
  const filtered = filter==='all' ? appointments : appointments.filter(a=>a.status===filter);
  const count = (s) => s==='all' ? appointments.length : appointments.filter(a=>a.status===s).length;

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="appt-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:16 }}>
          <div>
            <div className="hero-tag" style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.2)', color:'var(--red)', backdropFilter:'none', width:'fit-content' }}>📅 Appointments</div>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2.2rem', marginTop:10 }}>Your <em style={{ fontStyle:'italic', color:'var(--red)' }}>Schedule</em></h2>
            <div className="red-rule"/>
          </div>
          <div style={{ display:'flex', gap:16, flexShrink:0 }}>
            {[
              { l:'Total', n:appointments.length },
              { l:'Pending', n:count('pending') },
              { l:'Completed', n:count('completed') },
            ].map(({l,n}) => (
              <div key={l} style={{ textAlign:'center', padding:'10px 18px', background:'var(--white)', borderRadius:'var(--r-md)', border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-xs)' }}>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.6rem', color:'var(--red)', fontWeight:700, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap', background:'var(--gray-100)', padding:6, borderRadius:'var(--r-md)', width:'fit-content' }}>
          {tabs.map(s => (
            <button key={s} onClick={()=>setFilter(s)}
              style={{ border:'none', borderRadius:10, padding:'8px 16px', cursor:'pointer', fontSize:'0.82rem', fontFamily:'Outfit, sans-serif', fontWeight:600, transition:'all 0.2s',
                background: filter===s ? 'var(--red)' : 'transparent',
                color: filter===s ? 'white' : 'var(--gray-600)' }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
              <span style={{ marginLeft:6, background: filter===s ? 'rgba(255,255,255,0.25)' : 'var(--gray-200)', color: filter===s ? 'white' : 'var(--gray-600)', borderRadius:10, padding:'1px 7px', fontSize:'0.72rem' }}>
                {count(s)}
              </span>
            </button>
          ))}
        </div>

        {filtered.length===0 ? (
          <div className="clinic-card"><div className="empty-state"><span className="empty-icon">📅</span><h5>No appointments found</h5><p style={{ fontSize:'0.88rem', marginTop:8 }}>No appointments match this filter.</p></div></div>
        ) : (
          <div className="clinic-card">
            <div className="table-responsive">
              <table className="clinic-table">
                <thead>
                  <tr>
                    <th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Notes</th><th>Status</th>
                    {user.role==='doctor' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(appt => (
                    <tr key={appt._id}>
                      <td>
                        <div style={{ fontWeight:600 }}>{appt.patient?.name}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--gray-600)' }}>{appt.patient?.email}</div>
                      </td>
                      <td style={{ fontWeight:500 }}>{appt.doctor?.user?.name||'—'}</td>
                      <td style={{ fontSize:'0.83rem', color:'var(--gray-700)' }}>{fmt(appt.dateTime)}</td>
                      <td style={{ maxWidth:200, fontSize:'0.83rem', color:'var(--gray-600)', fontStyle: appt.notes?'normal':'italic' }}>{appt.notes||'No notes'}</td>
                      <td><span className={`status-badge status-${appt.status}`}>{SL[appt.status]||appt.status}</span></td>
                      {user.role==='doctor' && (
                        <td>
                          {appt.status!=='completed'
                            ? <button className="btn btn-sm btn-outline-red" onClick={()=>setSelected(appt)}>+ Record</button>
                            : <span style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>Done ✓</span>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Health tips strip */}
        <div style={{ marginTop:'2rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:14 }}>
          {[
            { icon:'💊', t:'Take Medications',       d:'As prescribed by your doctor'       },
            { icon:'🥗', t:'Healthy Diet',            d:'Balanced nutrition supports healing' },
            { icon:'🏃', t:'Stay Active',             d:'30 min walk daily improves health'  },
            { icon:'😴', t:'Get Enough Sleep',        d:'7–8 hours is recommended'           },
          ].map(item => (
            <div key={item.t} style={{ background:'var(--white)', borderRadius:'var(--r-md)', padding:'16px', border:'1px solid var(--gray-200)', display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ fontSize:'1.5rem' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.82rem', color:'var(--dark)' }}>{item.t}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--gray-600)', marginTop:2 }}>{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <AddMedicalRecord appointment={selected} onClose={()=>setSelected(null)} onSuccess={()=>{ setSelected(null); fetchAll(); }}/>}
    </div>
  );
}
