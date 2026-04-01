import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initParticles } from '../utils/particles';

const ROLES = [
  { v:'patient', icon:'🧑‍💼', label:'Patient',  desc:'Book & manage appointments'    },
  { v:'doctor',  icon:'👨‍⚕️', label:'Doctor',   desc:'Manage your practice & patients' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'patient' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const cleanup  = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { cleanup.current = initParticles('reg-canvas', 'dark'); }, 60);
    return () => { clearTimeout(t); cleanup.current?.(); };
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const r = await register(form); loginUser(r.data.user); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left" style={{ position:'relative' }}>
        <canvas id="reg-canvas" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ marginBottom:'3rem' }}>
            <Link to="/" style={{ fontSize:'2rem', fontFamily:'Cormorant Garamond, serif', fontWeight:700, color:'white', textDecoration:'none' }}>✚ MediCare</Link>
          </div>
          <h2 style={{ color:'white', fontSize:'2.8rem', fontWeight:300, lineHeight:1.15, marginBottom:'0.5rem' }}>
            Join thousands<br/>of <em style={{ fontStyle:'italic' }}>patients</em><br/>& doctors.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.95rem', lineHeight:1.7, marginTop:16, maxWidth:320 }}>
            Create your account in seconds and get instant access to our network of specialist physicians.
          </p>
          <div style={{ marginTop:'3rem', display:'flex', flexDirection:'column', gap:12 }}>
            {['Free to join','Verified doctors only','24/7 appointment booking','Secure medical records'].map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,0.75)', fontSize:'0.88rem' }}>
                <span style={{ color:'rgba(255,255,255,0.9)', fontWeight:700 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card fade-in" style={{ maxWidth:460 }}>
          <div style={{ marginBottom:'2rem' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2rem', color:'var(--dark)' }}>Create account</h3>
            <p style={{ fontSize:'0.85rem', color:'var(--gray-600)', marginTop:4 }}>Fill in your details below</p>
          </div>

          {error && <div className="alert alert-danger" style={{ borderRadius:'var(--r-md)', fontSize:'0.85rem', borderLeft:'3px solid var(--red)', marginBottom:16 }}>{error}</div>}

          {/* Role picker */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {ROLES.map(r => (
              <button key={r.v} type="button" onClick={() => setForm({...form, role:r.v})}
                style={{ border:`2px solid ${form.role===r.v ? 'var(--red)' : 'var(--gray-200)'}`, background: form.role===r.v ? 'var(--red-muted)' : 'var(--gray-50)', borderRadius:'var(--r-md)', padding:'12px 10px', cursor:'pointer', transition:'all 0.2s', textAlign:'left' }}>
                <div style={{ fontSize:'1.3rem', marginBottom:4 }}>{r.icon}</div>
                <div style={{ fontWeight:700, fontSize:'0.82rem', color: form.role===r.v ? 'var(--red)' : 'var(--dark)' }}>{r.label}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--gray-600)', marginTop:2 }}>{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="clinic-form">
            <div className="mb-3">
              <label>Full Name</label>
              <input type="text" className="form-control" placeholder="Dr. John Smith"
                value={form.name} onChange={e => setForm({...form, name:e.target.value})} required/>
            </div>
            <div className="mb-3">
              <label>Email Address</label>
              <input type="email" className="form-control" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
            </div>
            <div className="mb-4">
              <label>Password</label>
              <input type="password" className="form-control" placeholder="At least 6 characters"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
            </div>
            <button type="submit" className="btn btn-red w-100" disabled={loading}>
              {loading ? <span className="d-flex align-items-center justify-content-center gap-2"><span className="spinner-border spinner-border-sm"/>Creating...</span> : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:'0.85rem', color:'var(--gray-600)', marginTop:20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--red)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
