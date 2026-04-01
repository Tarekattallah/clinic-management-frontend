import { useState, useEffect, useRef } from 'react';
import { getDoctors, updateDoctorProfile, updateDoctorSpecialties, getSpecialties } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initParticles } from '../utils/particles';

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const [form, setForm]     = useState({ bio:'', phone:'', experienceYears:0 });
  const [allSpecs, setAll]  = useState([]);
  const [selSpecs, setSel]  = useState([]);
  const [loading, setLoad]  = useState(true);
  const [saving, setSaving] = useState(false);
  const [savSp, setSavSp]   = useState(false);
  const [msg, setMsg]       = useState({ t:'', type:'' });
  const bgRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('prof-bg', 'light'); }, 60);
    Promise.all([getDoctors(), getSpecialties()]).then(([dR, sR]) => {
      const mine = dR.data.find(d => d.user?.email===user.email);
      if (mine) { setForm({ bio:mine.bio||'', phone:mine.phone||'', experienceYears:mine.experienceYears||0 }); setSel(mine.specialties?.map(s=>s._id)||[]); }
      setAll(sR.data);
    }).catch(console.error).finally(()=>setLoad(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, [user]);

  const flash = (t, type='success') => { setMsg({t,type}); setTimeout(()=>setMsg({t:'',type:''}),3500); };
  const saveProfile = async (e) => { e.preventDefault(); setSaving(true); try { await updateDoctorProfile(form); flash('Profile updated!'); } catch(err){ flash(err.response?.data?.message||'Error','danger'); } finally{ setSaving(false); } };
  const saveSpecs   = async () => { setSavSp(true); try { await updateDoctorSpecialties({ specialties:selSpecs }); flash('Specialties saved!'); } catch(err){ flash(err.response?.data?.message||'Error','danger'); } finally{ setSavSp(false); } };
  const toggleSpec  = (id) => setSel(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="prof-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Profile hero */}
        <div className="hero-section" style={{ padding:'2.5rem 3rem', marginBottom:'2rem', display:'flex', alignItems:'center', gap:24 }}>
          <canvas id="prof-hero-cv" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
          <div style={{ width:80, height:80, background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.2rem', border:'3px solid rgba(255,255,255,0.35)', flexShrink:0, position:'relative', zIndex:1 }}>👨‍⚕️</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Doctor Profile</div>
            <h1 style={{ fontSize:'2rem', margin:0 }}>Dr. <em>{user.name}</em></h1>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.88rem', marginTop:4 }}>{user.email}</div>
            {selSpecs.length>0 && <div style={{ marginTop:10 }}>{allSpecs.filter(s=>selSpecs.includes(s._id)).map(s=><span key={s._id} style={{ background:'rgba(255,255,255,0.15)', color:'white', fontSize:'0.72rem', fontWeight:600, padding:'3px 10px', borderRadius:20, margin:'2px', display:'inline-block', border:'1px solid rgba(255,255,255,0.25)' }}>{s.name}</span>)}</div>}
          </div>
        </div>

        {msg.t && <div className={`alert alert-${msg.type}`} style={{ borderRadius:'var(--r-md)', marginBottom:16, borderLeft:`3px solid ${msg.type==='success'?'#2E7D32':'var(--red)'}` }}>{msg.t}</div>}

        <div className="row g-4">
          {/* Profile form */}
          <div className="col-12 col-lg-7">
            <div className="clinic-card p-4">
              <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.4rem' }} className="mb-1">Personal Information</h5>
              <div className="red-rule"/>
              <form onSubmit={saveProfile} className="clinic-form">
                <div className="row g-3 mb-3">
                  <div className="col-6"><label>Name</label><input className="form-control" value={user.name} disabled style={{ background:'var(--gray-100)' }}/></div>
                  <div className="col-6"><label>Email</label><input className="form-control" value={user.email} disabled style={{ background:'var(--gray-100)' }}/></div>
                </div>
                <div className="mb-3">
                  <label>Professional Bio</label>
                  <textarea className="form-control" rows={4} placeholder="Write a professional bio to help patients learn about you..." value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-6"><label>Phone</label><input className="form-control" placeholder="+20 1xx xxx xxxx" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                  <div className="col-6"><label>Years of Experience</label><input type="number" className="form-control" min={0} value={form.experienceYears} onChange={e=>setForm({...form,experienceYears:e.target.value})}/></div>
                </div>
                <button type="submit" className="btn btn-red" disabled={saving}>
                  {saving?<span className="d-flex align-items-center gap-2"><span className="spinner-border spinner-border-sm"/>Saving...</span>:'💾 Save Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* Specialties + stats */}
          <div className="col-12 col-lg-5 d-flex flex-column gap-4">
            <div className="clinic-card p-4">
              <h5 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.4rem' }} className="mb-1">Medical Specialties</h5>
              <div className="red-rule"/>
              <p style={{ fontSize:'0.83rem', color:'var(--gray-600)', marginBottom:16 }}>Select your areas of expertise. Patients will see these on your profile.</p>
              {allSpecs.length===0 ? <p style={{ fontSize:'0.85rem', color:'var(--gray-400)', fontStyle:'italic' }}>No specialties available yet.</p> : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                  {allSpecs.map(s => {
                    const on = selSpecs.includes(s._id);
                    return (
                      <button key={s._id} type="button" onClick={()=>toggleSpec(s._id)}
                        style={{ border:`2px solid ${on?'var(--red)':'var(--gray-200)'}`, background: on?'var(--red)':'var(--gray-50)', color: on?'white':'var(--gray-700)', borderRadius:30, padding:'6px 14px', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, transition:'all 0.2s', fontFamily:'Outfit, sans-serif' }}>
                        {on?'✓ ':''}{s.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <button className="btn btn-red w-100" onClick={saveSpecs} disabled={savSp}>
                {savSp?<span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Saving...</span>:'Save Specialties'}
              </button>
            </div>

            {/* Quick stats */}
            <div style={{ background:'linear-gradient(135deg,var(--red),var(--red-deeper))', borderRadius:'var(--r-lg)', padding:'1.6rem', color:'white', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:'-10px', top:'-10px', fontSize:'8rem', opacity:0.06, fontFamily:'Cormorant Garamond, serif' }}>✚</div>
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.2rem', marginBottom:16, position:'relative', zIndex:1 }}>Profile Completion</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, position:'relative', zIndex:1 }}>
                {[
                  { l:'Bio', done:!!form.bio },
                  { l:'Phone', done:!!form.phone },
                  { l:'Experience', done:form.experienceYears>0 },
                  { l:'Specialties', done:selSpecs.length>0 },
                ].map(({l,done}) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:20, height:20, borderRadius:'50%', background: done?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.2)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', flexShrink:0 }}>{done?'✓':''}</span>
                    <span style={{ fontSize:'0.82rem', opacity: done?1:0.6 }}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16, position:'relative', zIndex:1 }}>
                {(() => { const done=[!!form.bio,!!form.phone,form.experienceYears>0,selSpecs.length>0].filter(Boolean).length; const pct=Math.round(done/4*100); return (
                  <>
                    <div style={{ fontSize:'0.75rem', opacity:0.7, marginBottom:6 }}>{pct}% complete</div>
                    <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:4, height:6 }}>
                      <div style={{ background:'white', width:`${pct}%`, height:'100%', borderRadius:4, transition:'width 0.4s' }}/>
                    </div>
                  </>
                ); })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
