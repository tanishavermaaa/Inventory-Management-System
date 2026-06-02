import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import socket from '../socket';
import { API_BASE_URL } from '../config';

const BASE = `${API_BASE_URL}/api/categories`;

export default function Categories() {
  const [categories,    setCategories]    = useState([]);
  const [categoryName,  setCategoryName]  = useState('');
  const [categoryDesc,  setCategoryDesc]  = useState('');
  const [editId,        setEditId]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [popup,         setPopup]         = useState({ show: false, message: '' });
  const [sidebarW,      setSidebarW]      = useState(220);
  const [search,        setSearch]        = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredCategories = categories.filter(c =>
    c.categoryName.toLowerCase().includes(search.toLowerCase()) ||
    (c.productNames && c.productNames.some(pName => pName.toLowerCase().includes(search.toLowerCase())))
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [categories, totalPages]);

  const showPopup  = (msg) => setPopup({ show: true,  message: msg });
  const closePopup = ()    => setPopup({ show: false, message: '' });

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  /* ── fetch all categories ── */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(BASE, { headers });
      setCategories(res.data);
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    socket.on('category:added', (newCat) => {
      fetchCategories(); // Refresh fully to get product mappings correctly
    });

    socket.on('category:updated', (updatedCat) => {
      fetchCategories();
    });

    socket.on('category:deleted', ({ _id }) => {
      setCategories(prev => prev.filter(c => c._id !== _id));
    });

    return () => {
      socket.off('category:added');
      socket.off('category:updated');
      socket.off('category:deleted');
    };
  }, []);

  /* ── Update Category ── */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${BASE}/${editId}`, {
        categoryName,
        categoryDescription: categoryDesc,
      }, { headers });
      showPopup('Category Updated Successfully!');
      setCategoryName('');
      setCategoryDesc('');
      setEditId(null);
      fetchCategories();
    } catch (err) {
      showPopup(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  /* ── Edit Button Handler ── */
  const handleEdit = (cat) => {
    setEditId(cat._id);
    setCategoryName(cat.categoryName);
    setCategoryDesc(cat.categoryDescription || '');
  };

  const handleCancel = () => {
    setEditId(null);
    setCategoryName('');
    setCategoryDesc('');
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`${BASE}/${id}`, { headers });
      showPopup('Category Deleted Successfully!');
      fetchCategories();
    } catch (err) {
      showPopup(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar onWidthChange={setSidebarW} />

      {/* ── Info Popup ── */}
      {popup.show && (
        <div style={{ ...styles.overlay, zIndex: 10500 }}>
          <div style={styles.modal}>
            <p style={{ fontSize: '15px', color: '#333', marginBottom: '20px' }}>
              {popup.message}
            </p>
            <button onClick={closePopup} style={styles.okBtn}>OK</button>
          </div>
        </div>
      )}

      {/* ── Edit Category Modal ── */}
      {editId && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, textAlign: 'left', minWidth: '400px' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '20px' }}>Edit Category</h5>
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Category Name</label>
                <input
                  className="form-control"
                  placeholder="Category Name"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Description</label>
                <input
                  className="form-control"
                  placeholder="Category Description"
                  value={categoryDesc}
                  onChange={e => setCategoryDesc(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Page Content ── */}
      <div style={{
        marginLeft: sidebarW,
        padding: '32px',
        width: `calc(100vw - ${sidebarW}px)`,
        transition: 'all 0.25s ease',
        boxSizing: 'border-box',
        minWidth: 0,
      }}>
        
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h4 style={{ fontWeight: '700', fontSize: '28px', color: '#222', margin: 0 }}>
            Category Management
          </h4>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#198754', fontWeight: 600 }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#198754', display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }} />
            Live
          </span>
        </div>

        {/* Search Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ flex: 1, padding: '10px 16px', fontSize: '14px' }}
            placeholder="Search categories by category name or product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table Container */}
        <div style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflowX: 'auto',
        }}>
          <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                <th style={{ ...styles.th, width: '80px' }}>S No</th>
                <th style={styles.th}>Category Name</th>
                <th style={styles.th}>Product Names</th>
                <th style={{ ...styles.th, width: '180px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-5">
                    No categories found. Categories are automatically created when products are added.
                  </td>
                </tr>
              ) : (
                currentItems.map((cat, i) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={styles.td}>{indexOfFirstItem + i + 1}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{cat.categoryName}</td>
                    <td style={styles.td}>
                      {cat.productNames && cat.productNames.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {cat.productNames.map((name, idx) => (
                            <span key={idx} style={{
                              background: '#e9ecef', color: '#495057',
                              padding: '2px 8px', borderRadius: '4px',
                              fontSize: '13px', fontWeight: 500
                            }}>{name}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#aaa', fontStyle: 'italic' }}>No Products</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button style={{ background: 'none', border: 'none', color: '#0d6efd', fontWeight: 600, cursor: 'pointer', marginRight: '12px' }} onClick={() => handleEdit(cat)}>
                        Edit
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#dc3545', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDelete(cat._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingBottom: '20px' }}>
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

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: '#fff', borderRadius: '10px',
    padding: '36px 40px', minWidth: '300px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  okBtn: {
    background: '#0d6efd', color: '#fff',
    border: 'none', borderRadius: '6px',
    padding: '8px 36px', fontSize: '15px', cursor: 'pointer',
  },
  th: { padding: '14px 16px', fontWeight: 600, fontSize: '14px', color: '#333', background: '#fff', textAlign: 'left' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333', verticalAlign: 'middle', textAlign: 'left' },
};