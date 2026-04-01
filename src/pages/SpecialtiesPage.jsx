import { useState, useEffect, useRef } from 'react';
import { getSpecialties, createSpecialty, deleteSpecialty } from '../services/api';
import { initParticles } from '../utils/particles';

export default function SpecialtiesPage() {
  const [specs, setSpecs]       = useState([]);
  const [name, setName]         = useState('');
  const [loading, setLoad]      = useState(true);
  const [creating, setCreating] = useState(false);
  const [delId, setDelId]       = useState(null);
  const [msg, setMsg]           = useState({ t:'', type:'' });
  const bgRef = useRef(null);

  const flash = (t, type='success') => { setMsg({t,type}); setTimeout(()=>setMsg({t:'',type:''}),3500); };

  const fetchAll = async () => { try { const r = await getSpecialties(); setSpecs(r.data); } catch(e){console.error(e);} finally{setLoad(false);} };
  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('spec-bg', 'light'); }, 60);
    fetchAll();
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const create = async (e) => {
    e.preventDefault(); if (!name.trim()) return; setCreating(true);
    try { await createSpecialty({name}); setName(''); flash('Specialty added!'); fetchAll(); }
    catch(err){ flash(err.response?.data?.message||'Error','danger'); } finally{ setCreating(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this specialty?')) return; setDelId(id);
    try { await deleteSpecialty(id); setSpecs(p=>p.filter(s=>s._id!==id)); }
    catch(err){ flash(err.response?.data?.message||'Error deleting','danger'); } finally{ setDelId(null); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  const SUGGESTED = ['Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','Ophthalmology','Gynecology','Oncology','Radiology','Psychiatry'];
  const notAdded  = SUGGESTED.filter(s => !specs.find(x=>x.name.toLowerCase()===s.toLowerCase()));

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="spec-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <div className="hero-tag" style={{ background:'var(--red-muted)', border:'1px solid rgba(200,39,45,0.2)', color:'var(--red)', backdropFilter:'none', width:'fit-content' }}>🏥 Specialties</div>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2.2rem', marginTop:10 }}>Manage <em style={{ fontStyle:'italic', color:'var(--red)' }}>Specialties</em></h2>
          <div className="red-rule"/>
          <p style={{ color:'var(--gray-600)', fontSize:'0.92rem' }}>Define the medical disciplines available in your clinic system.</p>
        </div>

        {msg.t && <div className={`alert alert-${msg.type}`} style={{ borderRadius:'var(--r-md)', marginBottom:16, borderLeft:`3px solid ${msg.type==='success'?'#2E7D32':'var(--red)'}` }}>{msg.t}</div>}

        <div className="row g-4">
          {/* Add form */}
          <div className="col-12 col-md-5">
            <div className="clinic-card p-4">
              <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.3rem' }} className="mb-1">Add New Specialty</h5>
              <div className="red-rule"/>
              <form onSubmit={create} className="clinic-form">
                <div className="mb-3">
                  <label>Specialty Name</label>
                  <input className="form-control" placeholder="e.g. Cardiology, Pediatrics..." value={name} onChange={e=>setName(e.target.value)} required/>
                </div>
                <button type="submit" className="btn btn-red w-100" disabled={creating}>
                  {creating?<span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Adding...</span>:'+ Add Specialty'}
                </button>
              </form>

              {/* Quick-add suggestions */}
              {notAdded.length>0 && (
                <div style={{ marginTop:20 }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, marginBottom:10 }}>Quick Add</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {notAdded.slice(0,6).map(s => (
                      <button key={s} type="button" onClick={()=>setName(s)}
                        style={{ border:'1.5px solid var(--gray-200)', background:'var(--gray-50)', borderRadius:20, padding:'5px 12px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:'Outfit, sans-serif', color:'var(--gray-700)', transition:'all 0.2s' }}
                        onMouseEnter={e=>{e.target.style.borderColor='var(--red)';e.target.style.color='var(--red)';}}
                        onMouseLeave={e=>{e.target.style.borderColor='var(--gray-200)';e.target.style.color='var(--gray-700)';}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List */}
          <div className="col-12 col-md-7">
            <div className="clinic-card p-4">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.3rem', margin:0 }}>Active Specialties</h5>
                <span style={{ background:'var(--red-muted)', color:'var(--red)', borderRadius:20, padding:'3px 12px', fontSize:'0.75rem', fontWeight:700 }}>{specs.length}</span>
              </div>
              <div className="red-rule"/>
              {specs.length===0 ? (
                <div className="empty-state py-3"><span className="empty-icon">🏥</span><h5>No specialties yet</h5></div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {specs.map((s,i) => (
                    <div key={s._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background: i%2===0 ? 'var(--gray-50)' : 'var(--white)', borderRadius:'var(--r-md)', border:'1px solid var(--gray-200)', transition:'border-color 0.2s' }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--red)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--gray-200)'}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, background:'var(--red-muted)', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🏥</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{s.name}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:1 }}>Added {new Date(s.createdAt).toLocaleDateString('en-GB')}</div>
                        </div>
                      </div>
                      <button onClick={()=>del(s._id)} disabled={delId===s._id}
                        style={{ background:'none', border:'1.5px solid var(--gray-200)', color:'var(--gray-600)', borderRadius:'var(--r-sm)', padding:'6px 12px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, transition:'all 0.2s', fontFamily:'Outfit, sans-serif' }}
                        onMouseEnter={e=>{e.target.style.borderColor='var(--red)';e.target.style.color='var(--red)';e.target.style.background='var(--red-muted)';}}
                        onMouseLeave={e=>{e.target.style.borderColor='var(--gray-200)';e.target.style.color='var(--gray-600)';e.target.style.background='none';}}>
                        {delId===s._id?<span className="spinner-border spinner-border-sm"/>:'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
