import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SOMALI_REGIONS, REGION_NAMES } from '../data/somaliRegions';
import { SKILL_TASKS } from '../data/skillTasks';
import './Auth.css';

const SKILLS = ['Cleaning', 'Cooking', 'Child Care', 'Laundry', 'Ironing', 'Elder Care', 'Gardening', 'Security'];
const JOB_TYPES = ['House Cleaning', 'Cooking', 'Babysitter', 'Nanny', 'Driver', 'Gardener', 'Security Guard', 'Elder Care'];

// build a full email from a username; if it already has @, keep it, otherwise append @gmail.com
const buildEmail = (username) => {
  const u = username.trim();
  if (!u) return '';
  return u.includes('@') ? u.toLowerCase() : `${u.toLowerCase()}@gmail.com`;
};

export default function Register() {
  const [params] = useSearchParams();
  const [type, setType] = useState(params.get('type') === 'worker' ? 'worker' : 'household');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [form, setForm] = useState({
    name: '', password: '', phone: '',
    skills: [], jobTypes: [], specialties: [], experience: 0, bio: '', nationality: 'Somalia', languages: ['Somali'],
    salaryMin: 150, salaryMax: 300, idNumber: '',
    guarantor: { name: '', idName: '', idNumber: '', phone: '', relationship: '', idImage: '' },
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleSkill = (s) => setForm(f => {
    const has = f.skills.includes(s);
    const skills = has ? f.skills.filter(x => x !== s) : [...f.skills, s];
    // if a skill is removed, also drop its sub-task specialties
    const specialties = has ? f.specialties.filter(sp => !(SKILL_TASKS[s] || []).includes(sp)) : f.specialties;
    return { ...f, skills, specialties };
  });
  const toggleJob = (j) => setForm(f => ({ ...f, jobTypes: f.jobTypes.includes(j) ? f.jobTypes.filter(x => x !== j) : [...f.jobTypes, j] }));
  const toggleSpecialty = (sp) => setForm(f => ({ ...f, specialties: f.specialties.includes(sp) ? f.specialties.filter(x => x !== sp) : [...f.specialties, sp] }));
  const setGuarantor = (key, val) => setForm(f => ({ ...f, guarantor: { ...f.guarantor, [key]: val } }));

  const handleIdImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('ID image must be under 5 MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setGuarantor('idImage', reader.result); // base64 data URL
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const email = buildEmail(username);
    if (!email) { setError('Please enter a username.'); return; }
    if (!region || !district) { setError('Please select your region and district.'); return; }
    const location = `${district}, ${region}, Somalia`;

    if (type === 'worker') {
      const g = form.guarantor;
      if (!g.name.trim() || !g.idName.trim() || !g.idNumber.trim()) {
        setError('Guarantor name, ID name, and ID number are required.'); return;
      }
      if (!g.idImage) {
        setError("Please upload a photo of the guarantor's ID."); return;
      }
      if (g.name.trim().toLowerCase().replace(/\s+/g, ' ') !== g.idName.trim().toLowerCase().replace(/\s+/g, ' ')) {
        setError('Guarantor name does not match the name on the ID.'); return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name, email, password: form.password, phone: form.phone, location,
      };
      if (type === 'worker') {
        Object.assign(payload, {
          skills: form.skills, jobTypes: form.jobTypes, specialties: form.specialties, experience: form.experience,
          bio: form.bio, nationality: form.nationality, languages: form.languages,
          idNumber: form.idNumber,
          salary: { min: Number(form.salaryMin), max: Number(form.salaryMax), currency: 'USD' },
          guarantor: form.guarantor,
        });
      }
      const res = type === 'worker'
        ? await authAPI.registerWorker(payload)
        : await authAPI.registerHousehold(payload);
      login(res.data.token, res.data.user, res.data.user.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🏠</div>
          <h2>HomeCare</h2>
          <p>Join Somalia's trusted platform</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature"><span>🔒</span> Secure &amp; Verified</div>
          <div className="auth-feature"><span>📱</span> Available on Mobile</div>
          <div className="auth-feature"><span>💰</span> Fair Pay, Safe Work</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <h1>Create Account</h1>
          <p className="auth-subtitle">Join HomeCare today</p>

          <div className="role-tabs">
            <button className={`role-tab ${type === 'household' ? 'active' : ''}`} onClick={() => setType('household')}>👨‍👩‍👧 Family</button>
            <button className={`role-tab ${type === 'worker' ? 'active' : ''}`} onClick={() => setType('worker')}>👷 Worker</button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Username</label>
              <div className="email-input-wrap">
                <input type="text" required value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s/g, ''))} />
                <span className="email-suffix">@gmail.com</span>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Region (Gobol)</label>
              <select required value={region} onChange={e => { setRegion(e.target.value); setDistrict(''); }}>
                <option value="">Select region...</option>
                {REGION_NAMES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>District (Degmo)</label>
              <select required value={district} disabled={!region} onChange={e => setDistrict(e.target.value)}>
                <option value="">{region ? 'Select district...' : 'Select a region first'}</option>
                {region && SOMALI_REGIONS[region].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {type === 'worker' && (
              <>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input type="number" min="0" max="50" value={form.experience} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} />
                </div>

                <div className="form-group">
                  <label>Expected Salary (USD / month)</label>
                  <div className="salary-row">
                    <input type="number" min="0" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} />
                    <span className="salary-dash">—</span>
                    <input type="number" min="0" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Your National ID Number</label>
                  <input type="text" value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Skills</label>
                  <div className="register-skills">
                    {SKILLS.map(s => (
                      <button type="button" key={s} className={`skill-chip ${form.skills.includes(s) ? 'selected' : ''}`} onClick={() => toggleSkill(s)}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Sub-tasks (specialties) per selected skill */}
                {form.skills.map(skill => (
                  <div className="form-group specialty-group" key={skill}>
                    <label>{skill} — select specific tasks</label>
                    <div className="register-skills">
                      {(SKILL_TASKS[skill] || []).map(task => (
                        <button type="button" key={task}
                          className={`skill-chip small ${form.specialties.includes(task) ? 'selected' : ''}`}
                          onClick={() => toggleSpecialty(task)}>{task}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="form-group">
                  <label>Job Types</label>
                  <div className="register-skills">
                    {JOB_TYPES.map(j => (
                      <button type="button" key={j} className={`skill-chip ${form.jobTypes.includes(j) ? 'selected' : ''}`} onClick={() => toggleJob(j)}>{j}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>About You</label>
                  <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>

                {/* Guarantor (Damiin) section */}
                <div className="guarantor-section">
                  <div className="guarantor-title">🛡️ Guarantor (Damiin) — required</div>
                  <p className="guarantor-note">A worker must provide a guarantor. The guarantor name must match the name on the guarantor's ID.</p>

                  <div className="form-group">
                    <label>Guarantor Full Name</label>
                    <input type="text" required value={form.guarantor.name} onChange={e => setGuarantor('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Name as written on Guarantor's ID</label>
                    <input type="text" required value={form.guarantor.idName} onChange={e => setGuarantor('idName', e.target.value)} />
                    {form.guarantor.name && form.guarantor.idName && (
                      form.guarantor.name.trim().toLowerCase() === form.guarantor.idName.trim().toLowerCase()
                        ? <span className="match-ok">✅ Names match</span>
                        : <span className="match-bad">❌ Names do not match</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Guarantor ID Number</label>
                    <input type="text" required value={form.guarantor.idNumber} onChange={e => setGuarantor('idNumber', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Upload Guarantor's ID (photo)</label>
                    <input type="file" accept="image/*" className="id-file-input" onChange={handleIdImage} />
                    {form.guarantor.idImage && (
                      <div className="id-preview">
                        <img src={form.guarantor.idImage} alt="Guarantor ID" />
                        <button type="button" className="id-remove" onClick={() => setGuarantor('idImage', '')}>✕ Remove</button>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Guarantor Phone</label>
                    <input type="tel" value={form.guarantor.phone} onChange={e => setGuarantor('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Relationship to Worker</label>
                    <input type="text" value={form.guarantor.relationship} onChange={e => setGuarantor('relationship', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
