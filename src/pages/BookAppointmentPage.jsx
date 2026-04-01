import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDoctors, createAppointment } from '../services/api';
import { initParticles } from '../utils/particles';

const TIPS = [
  { icon:'⏰', t:'Arrive Early',        d:'Please arrive 10–15 minutes before your scheduled time.' },
  { icon:'📋', t:'Bring Records',       d:'Bring any previous test results or prescriptions.'       },
  { icon:'💳', t:'Insurance Card',      d:'Have your insurance card ready if applicable.'           },
  { icon:'🚫', t:'Cancellation Policy', d:'Cancel at least 24 hours in advance to avoid a fee.'    },
];

export default function BookAppointmentPage() {
  const [doctors, setDoctors]   = useState([]);
  const [form, setForm]         = useState({ doctorId:'', dateTime:'', notes:'' });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,  setError]      = useState('');
  const [success, setSuccess]   = useState('');
  const [selDoc, setSelDoc]     = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const bgRef    = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('book-bg', 'light'); }, 60);
    getDoctors().then(r => {
      setDoctors(r.data);
      if (location.state?.doctorId) {
        setForm(f => ({ ...f, doctorId: location.state.doctorId }));
        setSelDoc(r.data.find(d => d._id === location.state.doctorId));
      }
    }).catch(console.error).finally(() => setFetching(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const handleDocChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, doctorId: id });
    setSelDoc(doctors.find(d => d._id === id) || null);
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try { await createAppointment(form); setSuccess('✅ Appointment booked!'); setTimeout(() => navigate('/appointments'), 2000); }
    catch (err) { setError(err.response?.data?.message || 'Failed to book.'); }
    finally { setLoading(false); }
  };

  const minDate = new Date(Date.now() + 60000).toISOString().slice(0,16);

  if (fetching) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="book-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.5 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div className="section-header">
          <div className="hero-tag" style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.2)', color:'var(--red)', backdropFilter:'none', width:'fit-content' }}>📅 New Appointment</div>
          <h2 style={{ marginTop:12 }}>Book an <em style={{ fontStyle:'italic', color:'var(--red)' }}>Appointment</em></h2>
          <div className="red-rule"/>
          <p>Select your preferred doctor and time slot below.</p>
        </div>

        <div className="row g-4">
          {/* Form */}
          <div className="col-12 col-lg-7">
            <div className="clinic-card p-4">
              {error   && <div className="alert alert-danger" style={{ borderRadius:'var(--r-md)', borderLeft:'3px solid var(--red)', fontSize:'0.85rem', marginBottom:16 }}>{error}</div>}
              {success && <div className="alert alert-success" style={{ borderRadius:'var(--r-md)', fontSize:'0.85rem', marginBottom:16 }}>{success}</div>}

              <form onSubmit={submit} className="clinic-form">
                <div className="mb-4">
                  <label>Select Doctor</label>
                  <select className="form-select" value={form.doctorId} onChange={handleDocChange} required>
                    <option value="">— Choose a specialist —</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>Dr. {d.user?.name}{d.specialties?.length ? ` · ${d.specialties.map(s=>s.name).join(', ')}` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Selected doctor preview */}
                {selDoc && (
                  <div style={{ background:'var(--red-muted)', borderRadius:'var(--r-md)', padding:'14px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:14, border:'1px solid rgba(200,39,45,0.15)' }}>
                    <div style={{ width:44, height:44, background:'var(--white)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--dark)' }}>Dr. {selDoc.user?.name}</div>
                      {selDoc.specialties?.length>0 && <div style={{ fontSize:'0.78rem', color:'var(--red)', marginTop:2 }}>{selDoc.specialties.map(s=>s.name).join(' · ')}</div>}
                      {selDoc.experienceYears>0 && <div style={{ fontSize:'0.75rem', color:'var(--gray-600)', marginTop:2 }}>⏱ {selDoc.experienceYears} years experience</div>}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label>Date & Time</label>
                  <input type="datetime-local" className="form-control" value={form.dateTime} onChange={e=>setForm({...form, dateTime:e.target.value})} min={minDate} required/>
                </div>
                <div className="mb-4">
                  <label>Notes for Doctor (optional)</label>
                  <textarea className="form-control" rows={4} placeholder="Describe your symptoms, concerns, or anything relevant the doctor should know..."
                    value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}/>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-red flex-grow-1" disabled={loading} style={{ padding:'13px !important' }}>
                    {loading ? <span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Booking...</span> : '📅 Confirm Booking →'}
                  </button>
                  <button type="button" className="btn btn-outline-red" onClick={()=>navigate(-1)}>Back</button>
                </div>
              </form>
            </div>
          </div>

          {/* Tips sidebar */}
          <div className="col-12 col-lg-5">
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'linear-gradient(135deg,var(--red),var(--red-deeper))', borderRadius:'var(--r-lg)', padding:'1.6rem', color:'white', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', right:'-10px', top:'-10px', fontSize:'6rem', opacity:0.07, fontFamily:'Cormorant Garamond, serif' }}>✚</div>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.3rem', fontWeight:600, marginBottom:8 }}>Booking Tips</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {TIPS.map(tip => (
                      <div key={tip.t} style={{ display:'flex', gap:12 }}>
                        <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{tip.icon}</span>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{tip.t}</div>
                          <div style={{ fontSize:'0.78rem', opacity:0.75, marginTop:2, lineHeight:1.5 }}>{tip.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="clinic-card p-4">
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.1rem', fontWeight:600, marginBottom:12, color:'var(--dark)' }}>Available Hours</div>
                {[['Monday – Friday','8:00 AM – 8:00 PM'],['Saturday','9:00 AM – 5:00 PM'],['Sunday','10:00 AM – 3:00 PM']].map(([d,h]) => (
                  <div key={d} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--gray-100)', fontSize:'0.85rem' }}>
                    <span style={{ color:'var(--gray-700)', fontWeight:500 }}>{d}</span>
                    <span style={{ color:'var(--red)', fontWeight:600 }}>{h}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', fontSize:'0.85rem' }}>
                  <span style={{ color:'var(--gray-700)', fontWeight:500 }}>Emergency</span>
                  <span style={{ color:'var(--red)', fontWeight:600 }}>24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
