import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import socket from '../socket';

export default function AdminUserOrders() {
  const [orders,       setOrders]       = useState([]);
  const [search,       setSearch]       = useState('');
  const [notifCount,   setNotifCount]   = useState(0);
  const [sidebarW,     setSidebarW]     = useState(220);
  const { toast, showToast, hideToast } = useToast();

  const loggedInUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const token   = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/orders/all', { headers });
      setOrders(res.data);
    } catch (err) {
      showToast('Failed to load orders', 'error');
    }
  };

  useEffect(() => {
    fetchOrders();

    // Real-time new order notification
    const onNewOrder = (data) => {
      // Check if this order is for this admin
      if (data.distributor_id && data.distributor_id !== loggedInUser.id) {
        return; // Skip notification for other admins
      }
      showToast(`🛒 ${data.message} — ${data.productName} (x${data.quantity})`, 'info');
      setNotifCount(c => c + 1);
      fetchOrders(); // refresh orders list
    };

    const onOrderUpdated = (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    };

    socket.off('order:new');
    socket.on('order:new', onNewOrder);
    socket.on('order:updated', onOrderUpdated);

    return () => {
      socket.off('order:new', onNewOrder);
      socket.off('order:updated', onOrderUpdated);
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5001/api/orders/${id}/status`,
        { status }, { headers });
      showToast(`Order ${status}!`, 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  // Filter only orders placed by employees (role !== 'admin')
  const userOrdersOnly = orders.filter(o => o.orderedBy && o.orderedBy.role !== 'admin');

  const filteredOrders = userOrdersOnly.filter(o =>
    o.productName.toLowerCase().includes(search.toLowerCase()) ||
    (o.orderedByName && o.orderedByName.toLowerCase().includes(search.toLowerCase())) ||
    (o.category && o.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [orders, totalPages]);

  const statusColor = (s) => ({
    Pending:   { bg: '#fef3c7', color: '#92400e' },
    Approved:  { bg: '#d1fae5', color: '#065f46' },
    Rejected:  { bg: '#fee2e2', color: '#991b1b' },
    Cancelled: { bg: '#f3f4f6', color: '#374151' },
  }[s] || { bg: '#f3f4f6', color: '#374151' });

  const td = { padding: '14px 16px', fontSize: '14px', verticalAlign: 'middle' };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar onWidthChange={setSidebarW} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div style={{
        marginLeft: sidebarW, padding: '32px',
        width: `calc(100vw - ${sidebarW}px)`,
        transition: 'all 0.25s ease', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: '24px' }}>
          <h4 style={{ fontWeight: 700, fontSize: '26px', margin: 0 }}>
            User Orders Management
          </h4>
          {notifCount > 0 && (
            <div style={{
              background: '#ef4444', color: '#fff', borderRadius: '20px',
              padding: '4px 14px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }} onClick={() => setNotifCount(0)}>
              🔔 {notifCount} new order{notifCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ flex: 1, minWidth: '180px', padding: '10px 16px', fontSize: '14px' }}
            placeholder="Search user orders by product, category, or employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{
          background: '#fff', borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'auto',
        }}>
          <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="table-light">
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                {['S.No','Product','Employee','Qty','Total','Status','Date','Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontWeight: 600, fontSize: '14px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                  No user orders yet.
                </td></tr>
              ) : currentItems.map((o, i) => {
                const ss = statusColor(o.status);
                return (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={td}>{indexOfFirstItem + i + 1}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{o.productName}</td>
                    <td style={td}>{o.orderedByName || 'Employee'}</td>
                    <td style={td}>{o.quantity}</td>
                    <td style={td}>₹{Number(o.totalPrice).toFixed(2)}</td>
                    <td style={td}>
                      <span style={{
                        background: ss.bg, color: ss.color,
                        padding: '4px 12px', borderRadius: '12px',
                        fontSize: '12px', fontWeight: 600
                      }}>{o.status}</span>
                    </td>
                    <td style={td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={td}>
                      {o.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-success btn-sm"
                            onClick={() => updateStatus(o._id, 'Approved')}>Approve</button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => updateStatus(o._id, 'Rejected')}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingBottom: '10px' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="btn btn-outline-secondary btn-sm"
              >&laquo;</button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`btn btn-sm ${num === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                >
                  {num}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="btn btn-outline-secondary btn-sm"
              >&raquo;</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
