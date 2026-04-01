import { useEffect, useState, useRef } from 'react';
import { getDoctors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { initParticles } from '../utils/particles';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [specFilter, setSpec] = useState('');
  const { user } = useAuth();
  const navigate  = useNavigate();
  const bgRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { bgRef.current = initParticles('docs-bg', 'light'); }, 60);
    getDoctors().then(r => setDoctors(r.data)).catch(console.error).finally(() => setLoading(false));
    return () => { clearTimeout(t); bgRef.current?.(); };
  }, []);

  const allSpecs = [...new Set(doctors.flatMap(d => d.specialties?.map(s=>s.name)||[]))].sort();

  const filtered = doctors.filter(d => {
    const nameMatch = d.user?.name?.toLowerCase().includes(search.toLowerCase());
    const specMatch = !specFilter || d.specialties?.some(s=>s.name===specFilter);
    return nameMatch && specMatch;
  });

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><div className="red-spinner"/></div>;

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <canvas id="docs-bg" style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.45 }}/>

      <div className="page-container stagger" style={{ position:'relative', zIndex:1 }}>

        {/* Header banner */}
        <div className="hero-section" style={{ padding:'3rem 3rem', marginBottom:'2.5rem' }}>
          <canvas id="docs-hero-cv" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
          <div className="hero-cross" style={{ fontSize:'14rem', opacity:0.06 }}>✚</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="hero-tag">👨‍⚕️ Medical Team</div>
            <h1 style={{ fontSize:'2.6rem' }}>Our Specialist <em>Doctors</em></h1>
            <p>Connect with our team of verified, experienced physicians across all specialties.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
          <div className="clinic-form" style={{ flex:1, minWidth:220 }}>
            <input className="form-control" placeholder="🔍 Search doctors..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {allSpecs.length>0 && (
            <div className="clinic-form" style={{ minWidth:200 }}>
              <select className="form-select" value={specFilter} onChange={e=>setSpec(e.target.value)}>
                <option value="">All Specialties</option>
                {allSpecs.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div style={{ fontSize:'0.82rem', color:'var(--gray-600)', fontWeight:500 }}>
            {filtered.length} doctor{filtered.length!==1?'s':''} found
          </div>
        </div>

        {filtered.length===0 ? (
          <div className="clinic-card"><div className="empty-state"><span className="empty-icon">👨‍⚕️</span><h5>No doctors found</h5><p style={{ marginTop:8, fontSize:'0.88rem' }}>Try adjusting your search or filter.</p></div></div>
        ) : (
          <div className="row g-4">
            {filtered.map(doc => (
              <div className="col-12 col-sm-6 col-lg-4" key={doc._id}>
                <div className="doctor-card" style={{ position:'relative', height:'100%' }}>
                  <div className="doc-banner" style={{ position:'relative' }}/>
                  <div className="doc-avatar">👨‍⚕️</div>
                  <div className="doc-body" style={{ display:'flex', flexDirection:'column', height:'calc(100% - 90px)' }}>
                    <div className="doc-name">Dr. {doc.user?.name}</div>
                    <div className="doc-email">{doc.user?.email}</div>
                    {doc.bio && <p style={{ fontSize:'0.82rem', color:'var(--gray-600)', marginTop:10, lineHeight:1.6, flexGrow:1 }}>{doc.bio}</p>}
                    <div style={{ display:'flex', gap:16, marginTop:10, fontSize:'0.78rem', color:'var(--gray-500)' }}>
                      {doc.experienceYears>0 && <span>⏱ {doc.experienceYears} yrs</span>}
                      {doc.phone && <span>📞 {doc.phone}</span>}
                    </div>
                    {doc.specialties?.length>0 && <div style={{ marginTop:10 }}>{doc.specialties.map(s=><span key={s._id} className="specialty-tag">{s.name}</span>)}</div>}
                    <div style={{ marginTop:14 }}>
                      {user?.role==='patient'
                        ? <button className="btn btn-red w-100 btn-sm" onClick={()=>navigate('/book',{state:{doctorId:doc._id,doctorName:doc.user?.name}})}>Book Appointment</button>
                        : <button className="btn btn-outline-red w-100 btn-sm" onClick={()=>navigate('/login')}>Sign In to Book</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info strip */}
        {filtered.length>0 && (
          <div className="info-strip" style={{ marginTop:'2.5rem' }}>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.4rem', color:'white', fontWeight:600 }}>Can't find the right specialist?</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', marginTop:4 }}>Our team will help match you with the perfect doctor for your needs.</div>
            </div>
            <a href="mailto:support@medicare.io" className="btn" style={{ background:'white', color:'var(--red)', fontWeight:700, borderRadius:'var(--r-md)', padding:'11px 24px', position:'relative', zIndex:1, flexShrink:0 }}>
              Contact Us →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
