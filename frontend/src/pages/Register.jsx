import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaBoxOpen } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/admin-exists`)
      .then(res => setAdminExists(res.data.exists))
      .catch(err => console.error(err));
  }, []);

  const validateField = (name, value, currentForm) => {
    let error = null;
    switch (name) {
      case 'name':
        if (!value.trim()) error = "Full Name is required";
        break;
      case 'email':
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case 'password':
        if (!value) error = "Password is required";
        else if (value.length < 12) error = "Password must be at least 12 characters";
        break;
      case 'confirmPassword':
        if (!value) error = "Confirm Password is required";
        else if (currentForm.password !== value) error = "Passwords do not match";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    const error = validateField(name, value, newForm);
    setFieldErrors(prev => {
      const nextErrors = { ...prev, [name]: error };
      if (name === 'password' && newForm.confirmPassword) {
        nextErrors.confirmPassword = validateField('confirmPassword', newForm.confirmPassword, newForm);
      }
      return nextErrors;
    });
  };

  const validate = () => {
    let errors = {};
    const nameErr = validateField('name', form.name, form);
    if (nameErr) errors.name = nameErr;
    
    const emailErr = validateField('email', form.email, form);
    if (emailErr) errors.email = emailErr;
    
    const passErr = validateField('password', form.password, form);
    if (passErr) errors.password = passErr;
    
    const confirmErr = validateField('confirmPassword', form.confirmPassword, form);
    if (confirmErr) errors.confirmPassword = confirmErr;

    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      await axios.post(`${API_BASE_URL}/api/auth/register`, submitData);
      setSuccess("Account created successfully!");
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a202c', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ background: '#cca876', borderRadius: '4px', padding: '6px' }}>
            <FaBoxOpen color="#fff" size={20} />
          </div>
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>Inventory MS</span>
        </Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
          }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background='transparent'}>
            Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', padding: '48px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Create an Account</h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Join us and manage your inventory faster.</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', color: '#991b1b', fontSize: '14px', marginBottom: '24px' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 16px', color: '#166534', fontSize: '14px', marginBottom: '24px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Full Name</label>
              <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required autoComplete="off"
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${fieldErrors.name ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', fontSize: '15px', color: '#111827', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => !fieldErrors.name && (e.target.style.borderColor = '#22c55e')}
                onBlur={e => !fieldErrors.name && (e.target.style.borderColor = '#d1d5db')}
              />
              {fieldErrors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>{fieldErrors.name}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="new-password"
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${fieldErrors.email ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', fontSize: '15px', color: '#111827', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => !fieldErrors.email && (e.target.style.borderColor = '#22c55e')}
                onBlur={e => !fieldErrors.email && (e.target.style.borderColor = '#d1d5db')}
              />
              {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>{fieldErrors.email}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required minLength={12} autoComplete="new-password"
                  style={{ width: '100%', padding: '12px 48px 12px 16px', border: `1px solid ${fieldErrors.password ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', fontSize: '15px', color: '#111827', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => !fieldErrors.password && (e.target.style.borderColor = '#22c55e')}
                  onBlur={e => !fieldErrors.password && (e.target.style.borderColor = '#d1d5db')}
                />
                <span onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {fieldErrors.password && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>{fieldErrors.password}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirmPass ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required minLength={12} autoComplete="new-password"
                  style={{ width: '100%', padding: '12px 48px 12px 16px', border: `1px solid ${fieldErrors.confirmPassword ? '#ef4444' : '#d1d5db'}`, borderRadius: '8px', fontSize: '15px', color: '#111827', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => !fieldErrors.confirmPassword && (e.target.style.borderColor = '#22c55e')}
                  onBlur={e => !fieldErrors.confirmPassword && (e.target.style.borderColor = '#d1d5db')}
                />
                <span onClick={() => setShowConfirmPass(s => !s)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                  {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {fieldErrors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>{fieldErrors.confirmPassword}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Select Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid #d1d5db', borderRadius: '8px',
                  fontSize: '15px', color: '#111827',
                  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                  background: '#fff'
                }}
                onFocus={e => (e.target.style.borderColor = '#22c55e')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{
              background: loading ? '#9ca3af' : '#22c55e', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(34,197,94,0.3)'
            }} onMouseOver={e => !loading && (e.target.style.background = '#16a34a')} onMouseOut={e => !loading && (e.target.style.background = '#22c55e')}>
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }} onMouseOver={e => e.target.style.textDecoration='underline'} onMouseOut={e => e.target.style.textDecoration='none'}>
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}