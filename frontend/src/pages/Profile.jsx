import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { FaUserEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function Profile() {
  const [sidebarW, setSidebarW] = useState(220);
  const { toast, showToast, hideToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState(null);
  
  // Edit Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);

  const token = sessionStorage.getItem('token');
  const me = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isAdmin = me.role === 'admin';

  // Fetch full user profile details from backend
  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(res.data);
      setEditForm({ name: res.data.name, email: res.data.email });
    } catch (err) {
      console.error('Failed to fetch profile', err);
      // Fallback to local storage if API fails
      setProfileData(me);
      setEditForm({ name: me.name || '', email: me.email || '' });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await axios.put(
        'http://localhost:5001/api/users/profile',
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || 'Profile updated successfully!', 'success');
      setProfileData(prev => ({ ...prev, name: editForm.name, email: editForm.email }));
      setIsEditing(false);
      
      // Update session storage
      const updatedUser = { ...me, name: editForm.name, email: editForm.email };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    }
    setEditLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        'http://localhost:5001/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || 'Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      backgroundImage: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      color: 'var(--text-primary)',
      display: 'flex',
    }}>
      {isAdmin ? (
        <Sidebar onWidthChange={setSidebarW} />
      ) : (
        <EmployeeSidebar onWidthChange={setSidebarW} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div style={{
        marginLeft: sidebarW,
        padding: '40px',
        width: `calc(100vw - ${sidebarW}px)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          {/* Header Section */}
          <div style={{
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid rgba(0,0,0,0.05)',
            paddingBottom: '20px'
          }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '36px', color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
                Profile Dashboard
              </h1>
              {/* <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '16px' }}>
                Manage your account settings and change your password.
              </p> */}
            </div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #2e7d32 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)'
            }}>
              {profileData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* Unified Single Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.4)',
            width: '100%'
          }}>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '40px',
              alignItems: 'start',
            }}>
              
              {/* Left Column: Account Details / Edit Profile */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h5 style={{ fontWeight: 700, color: '#222', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <span style={{ display: 'inline-block', width: '4px', height: '24px', background: 'var(--accent-primary)', borderRadius: '2px' }}></span>
                    Account Details
                  </h5>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      style={styles.editBtn}
                    >
                      <FaUserEdit /> Edit Profile
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        if (profileData) {
                           setEditForm({ name: profileData.name, email: profileData.email });
                        }
                      }}
                      style={{...styles.editBtn, background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5'}}
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
                
                {profileData ? (
                  !isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Full Name</span>
                        <span style={styles.val}>{profileData.name}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email Address</span>
                        <span style={styles.val}>{profileData.email}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Account Role</span>
                        <span style={{
                          ...styles.val,
                          textTransform: 'capitalize',
                          background: isAdmin ? 'rgba(13, 110, 253, 0.1)' : 'rgba(25, 135, 84, 0.1)',
                          color: isAdmin ? '#0d6efd' : '#198754',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px'
                        }}>
                          {profileData.role}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Joined On</span>
                        <span style={styles.val}>
                          {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleEditProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <label style={styles.inputLabel}>Full Name</label>
                        <input
                          type="text"
                          style={styles.inputField}
                          value={editForm.name}
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label style={styles.inputLabel}>Email Address</label>
                        <input
                          type="email"
                          style={styles.inputField}
                          value={editForm.email}
                          onChange={e => setEditForm({...editForm, email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button
                          type="submit"
                          disabled={editLoading}
                          style={{
                            ...styles.updateBtn,
                            marginTop: 0,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: editLoading ? 0.7 : 1,
                            cursor: editLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FaSave /> {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Fetching profile info...</p>
                  </div>
                )}
              </div>

              {/* Right Column: Change Password */}
              <div>
                <div style={{ padding: '32px', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #e9ecef' }}>
                  <h5 style={{ fontWeight: 700, marginBottom: '24px', color: '#222', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-block', width: '4px', height: '24px', background: '#f59e0b', borderRadius: '2px' }}></span>
                    Security / Change Password
                  </h5>
                  
                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={styles.inputLabel}>Current Password</label>
                      <input
                        type="password"
                        style={{...styles.inputField, background: '#fff'}}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>New Password</label>
                      <input
                        type="password"
                        style={{...styles.inputField, background: '#fff'}}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Confirm New Password</label>
                      <input
                        type="password"
                        style={{...styles.inputField, background: '#fff'}}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        ...styles.updateBtn,
                        background: '#222',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'Processing...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px',
    fontSize: '15px',
    border: '1px solid #e9ecef',
    transition: 'background 0.2s ease',
  },
  label: {
    color: '#666',
    fontWeight: 500,
  },
  val: {
    color: '#111',
    fontWeight: 700,
  },
  inputLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#333',
    fontSize: '14px'
  },
  inputField: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid #dee2e6',
    background: '#f8f9fa',
    color: '#111',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  updateBtn: {
    marginTop: '10px',
    width: '100%',
    height: '50px',
    borderRadius: '10px',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    border: 'none',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
    transition: 'all 0.2s ease',
  },
  editBtn: {
    background: 'rgba(76, 175, 80, 0.1)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    padding: '6px 14px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  }
};
