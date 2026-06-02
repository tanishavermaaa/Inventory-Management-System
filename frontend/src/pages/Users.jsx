import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { API_BASE_URL } from '../config';

export default function Users() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [sidebarW, setSidebarW] = useState(220);
  const { toast, showToast, hideToast } = useToast();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [users, totalPages]);

  const token   = sessionStorage.getItem('token');
  const me      = JSON.parse(sessionStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  const otherAdminsCount = users.filter(u => u.role === 'admin' && u._id !== me.id).length;

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, { headers });
      setUsers(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const makeAdmin = async (id, name) => {
    if (!window.confirm(`Make ${name} an admin?`)) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/${id}/make-admin`, {}, { headers });
      showToast(res.data.message, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const removeAdmin = async (id, name) => {
    if (!window.confirm(`Remove admin role from ${name}?`)) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/${id}/remove-admin`, {}, { headers });
      showToast(res.data.message, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/users/${id}`, { headers });
      showToast(res.data.message, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const roleBadge = (role) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
    fontSize: '12px', fontWeight: 600,
    background: role === 'admin' ? '#dbeafe' : '#f3f4f6',
    color:      role === 'admin' ? '#1d4ed8' : '#374151',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar onWidthChange={setSidebarW} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div style={{
        marginLeft: sidebarW, padding: '32px',
        width: `calc(100vw - ${sidebarW}px)`,
        transition: 'all 0.25s ease', boxSizing: 'border-box',
      }}>
        <h4 style={{ fontWeight: 700, marginBottom: '24px', fontSize: '26px' }}>
          User Management
        </h4>

        <div style={{
          background: '#fff', borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'auto',
        }}>
          <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="table-light">
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                {['S.No', 'Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} colSpan={h === 'Actions' ? 2 : 1} style={{ padding: '14px 16px', fontWeight: 600, fontSize: '14px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                  No users found.
                </td></tr>
              ) : currentItems.map((u, i) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={td}>{indexOfFirstItem + i + 1}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    {u._id === me.id && (
                      <span style={{ fontSize: '11px', color: '#4CAF50' }}>(You)</span>
                    )}
                  </td>
                  <td style={td}>{u.email}</td>
                  <td style={td}><span style={roleBadge(u.role)}>{u.role}</span></td>
                  <td style={td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={td}>
                    {u.role !== 'admin' ? (
                      <button className="btn btn-primary btn-sm" style={{
                        width: '140px', height: '38px', fontWeight: '600',
                        borderRadius: '8px', border: 'none', transition: '0.2s'
                      }} onClick={() => makeAdmin(u._id, u.name)}>
                        Make Admin
                      </button>
                    ) : (
                      (u._id !== me.id || otherAdminsCount > 0) && (
                        <button className="btn btn-warning btn-sm" style={{
                          width: '140px', height: '38px', fontWeight: '600',
                          borderRadius: '8px', border: 'none', transition: '0.2s'
                        }} onClick={() => removeAdmin(u._id, u.name)}>
                          Remove Admin
                        </button>
                      )
                    )}
                  </td>
                  <td style={td}>
                    <button className="btn btn-danger btn-sm" style={{
                      width: '140px', height: '38px', fontWeight: '600',
                      borderRadius: '8px', border: 'none', transition: '0.2s'
                    }} onClick={() => deleteUser(u._id, u.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingBottom: '10px' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: currentPage === 1 ? '#f5f5f5' : '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? '#aaa' : '#333',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >&laquo;</button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: num === currentPage ? '1px solid #4CAF50' : '1px solid #ddd',
                    background: num === currentPage ? '#4CAF50' : '#fff',
                    color: num === currentPage ? '#fff' : '#333',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {num}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? '#aaa' : '#333',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >&raquo;</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const td = { padding: '14px 16px', fontSize: '14px', verticalAlign: 'middle' };