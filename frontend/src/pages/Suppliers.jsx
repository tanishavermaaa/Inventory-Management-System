import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import socket from '../socket';

const BASE = 'http://localhost:5001/api/suppliers';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [sidebarW, setSidebarW] = useState(220);
  const { toast, showToast, hideToast } = useToast();

  // Modal State
  const [modal, setModal] = useState({
    show: false,
    mode: 'add', // 'add' or 'edit'
    id: null,
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const token = sessionStorage.getItem('token');

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(res.data);
    } catch (err) {
      console.error('Fetch suppliers failed', err);
      showToast(err.response?.data?.message || 'Failed to load suppliers', 'error');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Socket.io Real-time Event Listeners
  useEffect(() => {
    socket.on('supplier:added', (newSup) => {
      setSuppliers(prev => {
        if (prev.some(s => s._id === newSup._id)) return prev;
        return [newSup, ...prev];
      });
    });

    socket.on('supplier:updated', (updatedSup) => {
      setSuppliers(prev => prev.map(s => s._id === updatedSup._id ? updatedSup : s));
    });

    socket.on('supplier:deleted', ({ _id }) => {
      setSuppliers(prev => prev.filter(s => s._id !== _id));
    });

    return () => {
      socket.off('supplier:added');
      socket.off('supplier:updated');
      socket.off('supplier:deleted');
    };
  }, []);

  // Modal Actions
  const openAddModal = () => {
    setModal({
      show: true,
      mode: 'add',
      id: null,
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'Active'
    });
    setFormErrors({});
  };

  const openEditModal = (sup) => {
    setModal({
      show: true,
      mode: 'edit',
      id: sup._id,
      name: sup.name,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      status: sup.status
    });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setModal(prev => ({ ...prev, show: false }));
    setFormErrors({});
  };

  // Submit Handler (Add / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!modal.name.trim()) errors.name = 'Supplier Name is required';
    if (!modal.contactPerson.trim()) errors.contactPerson = 'Contact Person is required';
    if (!modal.email.trim()) errors.email = 'Email Address is required';
    if (!modal.phone.trim()) errors.phone = 'Phone is required';
    if (!modal.address.trim()) errors.address = 'Address is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    const payload = {
      name: modal.name,
      contactPerson: modal.contactPerson,
      email: modal.email,
      phone: modal.phone,
      address: modal.address,
      status: modal.status
    };

    try {
      if (modal.mode === 'add') {
        const res = await axios.post(`${BASE}/add`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast(res.data.message || 'Supplier added successfully!');
      } else {
        const res = await axios.put(`${BASE}/${modal.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast(res.data.message || 'Supplier updated successfully!');
      }
      handleCloseModal();
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const res = await axios.delete(`${BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(res.data.message || 'Supplier deleted successfully!');
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  // Filtering
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [suppliers, totalPages]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar onWidthChange={setSidebarW} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* ── Modal overlay ── */}
      {modal.show && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h5 style={{ fontWeight: 700, marginBottom: '20px' }}>
              {modal.mode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
            </h5>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label fw-semibold">Supplier Name <span className="text-danger">*</span></label>
                <input
                  type="text" className={`form-control ${formErrors.name ? 'border-danger' : ''}`} placeholder="Company Name"
                  value={modal.name}
                  onChange={e => {
                    setModal(prev => ({ ...prev, name: e.target.value }));
                    if (e.target.value.trim()) setFormErrors(prev => ({...prev, name: ''}));
                  }}
                />
                {formErrors.name && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Contact Person <span className="text-danger">*</span></label>
                <input
                  type="text" className={`form-control ${formErrors.contactPerson ? 'border-danger' : ''}`} placeholder="Full Name"
                  value={modal.contactPerson}
                  onChange={e => {
                    setModal(prev => ({ ...prev, contactPerson: e.target.value }));
                    if (e.target.value.trim()) setFormErrors(prev => ({...prev, contactPerson: ''}));
                  }}
                />
                {formErrors.contactPerson && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.contactPerson}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
                <input
                  type="email" className={`form-control ${formErrors.email ? 'border-danger' : ''}`} placeholder="supplier@example.com"
                  value={modal.email}
                  onChange={e => {
                    setModal(prev => ({ ...prev, email: e.target.value }));
                    if (e.target.value.trim()) setFormErrors(prev => ({...prev, email: ''}));
                  }}
                />
                {formErrors.email && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.email}</div>}
              </div>

              {/* <div className="row"> */}
                <div className=" mb-3">
                  <label className="form-label fw-semibold">Phone <span className="text-danger">*</span></label>
                  <input
                    type="text" className={`form-control ${formErrors.phone ? 'border-danger' : ''}`} placeholder="Phone Number"
                    value={modal.phone}
                    onChange={e => {
                      setModal(prev => ({ ...prev, phone: e.target.value }));
                      if (e.target.value.trim()) setFormErrors(prev => ({...prev, phone: ''}));
                    }}
                  />
                  {formErrors.phone && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.phone}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={modal.status}
                    onChange={e => setModal(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              {/* </div> */}

              <div className="mb-4">
                <label className="form-label fw-semibold">Address <span className="text-danger">*</span></label>
                <textarea
                  className={`form-control ${formErrors.address ? 'border-danger' : ''}`} rows="2" placeholder="Full Address"
                  value={modal.address}
                  onChange={e => {
                    setModal(prev => ({ ...prev, address: e.target.value }));
                    if (e.target.value.trim()) setFormErrors(prev => ({...prev, address: ''}));
                  }}
                />
                {formErrors.address && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.address}</div>}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Supplier'}
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
        
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h4 style={{ fontWeight: '700', fontSize: '28px', color: '#222', margin: 0 }}>
            Supplier Management
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

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ flex: 1, minWidth: '180px', padding: '10px 16px', fontSize: '14px' }}
            placeholder="Search suppliers by name, contact person or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-success"
            style={{ padding: '10px 24px', whiteSpace: 'nowrap', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddModal}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Add Supplier
          </button>
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
                <th style={styles.th}>Supplier Name</th>
                <th style={styles.th}>Contact Person</th>
                <th style={styles.th}>Email Address</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, width: '180px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    No suppliers found. Click "Add Supplier" to create one.
                  </td>
                </tr>
              ) : (
                currentItems.map((sup, i) => (
                  <tr key={sup._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={styles.td}>{indexOfFirstItem + i + 1}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{sup.name}</td>
                    <td style={styles.td}>{sup.contactPerson}</td>
                    <td style={styles.td}>{sup.email}</td>
                    <td style={styles.td}>{sup.phone}</td>
                    <td style={styles.td}>{sup.address}</td>
                    <td style={styles.td}>
                      <span style={{
                        background: sup.status === 'Active' ? '#d1fae5' : '#fee2e2',
                        color: sup.status === 'Active' ? '#065f46' : '#991b1b',
                        padding: '4px 12px', borderRadius: '12px',
                        fontSize: '12px', fontWeight: 600,
                      }}>
                        {sup.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={{ background: 'none', border: 'none', color: '#0d6efd', fontWeight: 600, cursor: 'pointer', marginRight: '12px' }} onClick={() => openEditModal(sup)}>
                        Edit
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#dc3545', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDelete(sup._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
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

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: '#fff', borderRadius: '10px',
    padding: '36px 40px', minWidth: '450px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  th: { padding: '14px 16px', fontWeight: 600, fontSize: '14px', color: '#333', background: '#fff', textAlign: 'left' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333', verticalAlign: 'middle', textAlign: 'left' },
};
