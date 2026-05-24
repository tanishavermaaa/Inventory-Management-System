import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaBoxOpen } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setForm({ email: '', password: '' });
  }, []);

  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case 'email':
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case 'password':
        if (!value) error = "Password is required";
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

    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const validate = () => {
    let errors = {};
    const emailErr = validateField('email', form.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validateField('password', form.password);
    if (passErr) errors.password = passErr;
    
    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', form);
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user',  JSON.stringify(res.data.user));

      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (res.data.user.role === 'supplier') {
        navigate('/supplier-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      const msg  = err.response?.data?.message || 'Login failed';
      const code = err.response?.data?.code;
      setError(code === 'ACCOUNT_DELETED'
        ? '🚫 Your account has been deleted by admin.'
        : msg
      );
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <nav style={{
        background: '#1a202c',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ background: '#cca876', borderRadius: '4px', padding: '6px' }}>
            <FaBoxOpen color="#fff" size={20} />
          </div>
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>Inventory MS</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/register')} style={{
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background 0.2s'
          }} onMouseOver={e => e.target.style.background='#16a34a'} onMouseOut={e => e.target.style.background='#22c55e'}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          background: '#fff',
          padding: '48px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '440px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: '8px', padding: '12px 16px',
              color: '#991b1b', fontSize: '14px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required autoComplete="off"
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `1px solid ${fieldErrors.email ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px', fontSize: '15px', color: '#111827',
                  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
                onFocus={e => !fieldErrors.email && (e.target.style.borderColor = '#22c55e')}
                onBlur={e => !fieldErrors.email && (e.target.style.borderColor = '#d1d5db')}
              />
              {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>{fieldErrors.email}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" placeholder="Enter your password"
                  value={form.password} onChange={handleChange}
                  required autoComplete="new-password"
                  style={{
                    width: '100%', padding: '12px 48px 12px 16px',
                    border: `1px solid ${fieldErrors.password ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px', fontSize: '15px', color: '#111827',
                    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                  }}
                  onFocus={e => !fieldErrors.password && (e.target.style.borderColor = '#22c55e')}
                  onBlur={e => !fieldErrors.password && (e.target.style.borderColor = '#d1d5db')}
                />
                <span onClick={() => setShowPass(s => !s)} style={{
                  position: 'absolute', right: '16px', top: '50%',
                  transform: 'translateY(-50%)', cursor: 'pointer',
                  color: '#9ca3af', fontSize: '18px', display: 'flex', alignItems: 'center'
                }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {fieldErrors.password && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>{fieldErrors.password}</span>}
            </div>

            <button type="submit" disabled={loading} style={{
              background: loading ? '#9ca3af' : '#22c55e',
              color: '#fff', border: 'none', padding: '14px',
              borderRadius: '8px', fontSize: '16px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
              transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(34,197,94,0.3)'
            }} onMouseOver={e => !loading && (e.target.style.background = '#16a34a')} onMouseOut={e => !loading && (e.target.style.background = '#22c55e')}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}
              onMouseOver={e => e.target.style.textDecoration='underline'}
              onMouseOut={e => e.target.style.textDecoration='none'}
            >
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}