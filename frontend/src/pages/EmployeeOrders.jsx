// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import EmployeeSidebar from '../components/EmployeeSidebar';

// export default function EmployeeOrders() {
//   const [orders,   setOrders]   = useState([]);
//   const [sidebarW, setSidebarW] = useState(220);   // unchanged

//   const token   = localStorage.getItem('token');
//   const headers = { Authorization: `Bearer ${token}` };

//   useEffect(() => {
//     axios.get('http://localhost:5001/api/orders/mine', { headers })
//       .then(res => setOrders(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   const statusColor = (s) =>
//     s === 'Approved' ? '#198754' :
//     s === 'Rejected' ? '#dc3545' : '#fd7e14';

//   return (
//     // CHANGED: removed display:flex — causes double offset with fixed sidebar
//     <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

//       <EmployeeSidebar onWidthChange={setSidebarW} />

//       {/* CHANGED: width now uses 100vw instead of 100% to fill viewport correctly */}
//       <div style={{
//         marginLeft: sidebarW,
//         padding: '32px',
//         width: `calc(100vw - ${sidebarW}px)`,   // CHANGED: 100% → 100vw
//         transition: 'all 0.25s ease',
//         minWidth: 0,
//         boxSizing: 'border-box',                 // ADDED: padding included in width
//       }}>

//         <h4 style={{ fontWeight: 700, marginBottom: '24px' }}>My Orders</h4>

//         {/* CHANGED: overflow hidden → auto so table can scroll on small screens */}
//         <div style={{
//           background: '#fff', borderRadius: '8px',
//           boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
//           overflow: 'auto',                      // CHANGED: hidden → auto
//           width: '100%',                         // ADDED
//         }}>
//           {/* ADDED: width:100% and tableLayout:fixed so table fills full width */}
//           <table className="table mb-0" style={{
//             width: '100%',                       // ADDED
//             tableLayout: 'fixed',                // ADDED: equal column distribution
//             borderCollapse: 'collapse',          // ADDED
//           }}>
//             <thead>
//               <tr style={{ borderBottom: '2px solid #dee2e6' }}>
//                 {['#','Product','Category','Price','Qty','Total','Status','Date'].map(h => (
//                   // CHANGED: added overflow+textOverflow so text doesn't break layout
//                   <th key={h} style={{
//                     padding: '14px 16px',
//                     fontWeight: 600,
//                     fontSize: '14px',
//                     overflow: 'hidden',          // ADDED
//                     textOverflow: 'ellipsis',    // ADDED
//                     whiteSpace: 'nowrap',        // ADDED
//                   }}>
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {orders.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} style={{
//                     textAlign: 'center', padding: '32px', color: '#888'
//                   }}>
//                     No orders yet.
//                   </td>
//                 </tr>
//               ) : orders.map((o, i) => (
//                 <tr key={o._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
//                   {/* CHANGED: added overflow+ellipsis to every td */}
//                   <td style={td}>{i + 1}</td>
//                   <td style={td}>{o.productName}</td>
//                   <td style={td}>{o.category}</td>
//                   <td style={td}>${Number(o.price).toFixed(2)}</td>      {/* CHANGED: added .toFixed(2) */}
//                   <td style={td}>{o.quantity}</td>
//                   <td style={td}>${Number(o.totalPrice).toFixed(2)}</td> {/* CHANGED: added .toFixed(2) */}
//                   <td style={td}>
//                     <span style={{
//                       color: statusColor(o.status),
//                       fontWeight: 600,
//                       background:                                         // ADDED: colored badge
//                         o.status === 'Approved' ? '#d1fae5' :
//                         o.status === 'Rejected' ? '#fee2e2' : '#fff3e0',
//                       padding: '3px 10px',                               // ADDED
//                       borderRadius: '12px',                              // ADDED
//                       fontSize: '12px',                                  // ADDED
//                     }}>
//                       {o.status}
//                     </span>
//                   </td>
//                   <td style={td}>
//                     {new Date(o.createdAt).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ADDED: shared td style object to avoid repetition
// const td = {
//   padding: '14px 16px',
//   fontSize: '14px',
//   verticalAlign: 'middle',       // ADDED
//   overflow: 'hidden',            // ADDED
//   textOverflow: 'ellipsis',      // ADDED
//   whiteSpace: 'nowrap',          // ADDED
// };


import { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import socket from '../socket';

export default function EmployeeOrders() {
  const [orders,   setOrders]   = useState([]);
  const [search,   setSearch]   = useState('');
  const [sidebarW, setSidebarW] = useState(220);
  const { toast, showToast, hideToast } = useToast();

  // Placing order state
  const [products,     setProducts]     = useState([]);
  const [orderModal,   setOrderModal]   = useState({ show: false, selectedProduct: null });
  const [quantity,     setQuantity]     = useState(1);
  const [qtyError,     setQtyError]     = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  const token   = sessionStorage.getItem('token');
  const me      = JSON.parse(sessionStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/orders/mine', { headers });
      setOrders(res.data);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'ACCOUNT_DELETED') {
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/products', { headers });
      // Only show products with stock available
      setProducts(res.data.filter(p => p.stock > 0));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Listen for account deletion
    socket.on(`user:deleted:${me.id}`, () => {
      sessionStorage.clear();
      window.location.href = '/login';
    });

    // Listen for order updates (status changes) to update list in real-time
    const onOrderUpdated = (updatedOrder) => {
      if (updatedOrder.orderedBy && updatedOrder.orderedBy.toString() === me.id) {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      }
    };
    socket.on('order:updated', onOrderUpdated);

    return () => {
      socket.off(`user:deleted:${me.id}`);
      socket.off('order:updated', onOrderUpdated);
    };
  }, []);

  const openOrderModal = async () => {
    await fetchProducts();
    setQuantity(1);
    setQtyError('');
    setOrderModal({ show: true, selectedProduct: null });
  };

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    if (!prodId) {
      setOrderModal(prev => ({ ...prev, selectedProduct: null }));
      setQtyError('');
      return;
    }
    const prod = products.find(p => p._id === prodId);
    setOrderModal(prev => ({ ...prev, selectedProduct: prod }));
    setQuantity(1);
    setQtyError('');
  };

  const handleQtyChange = (e) => {
    const val = Number(e.target.value);
    setQuantity(val);
    const prod = orderModal.selectedProduct;
    if (!prod) return;
    if (val < 1) {
      setQtyError('Quantity must be at least 1.');
    } else if (val > prod.stock) {
      setQtyError(`Only ${prod.stock} units available in stock!`);
    } else {
      setQtyError('');
    }
  };

  const handlePlaceOrder = async () => {
    const prod = orderModal.selectedProduct;
    if (!prod) return;
    if (quantity < 1) { setQtyError('Quantity must be at least 1.'); return; }
    if (quantity > prod.stock) {
      setQtyError(`Only ${prod.stock} units available in stock!`);
      return;
    }
    setOrderLoading(true);
    try {
      await axios.post('http://localhost:5001/api/orders/place',
        { productId: prod._id, quantity },
        { headers }
      );
      showToast(`✅ Order placed for ${prod.name}!`, 'success');
      setOrderModal({ show: false, selectedProduct: null });
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Order failed', 'error');
    }
    setOrderLoading(false);
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await axios.put(
        `http://localhost:5001/api/orders/${id}/cancel`, {}, { headers }
      );
      showToast(res.data.message, 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancel failed', 'error');
    }
  };

  const statusStyle = (s) => ({
    Pending:   { bg: '#fef3c7', color: '#92400e' },
    Approved:  { bg: '#d1fae5', color: '#065f46' },
    Rejected:  { bg: '#fee2e2', color: '#991b1b' },
    Cancelled: { bg: '#f3f4f6', color: '#6b7280' },
  }[s] || { bg: '#f3f4f6', color: '#374151' });

  const filteredOrders = orders.filter(o =>
    o.productName.toLowerCase().includes(search.toLowerCase()) ||
    o.category.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <EmployeeSidebar onWidthChange={setSidebarW} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Order Modal */}
      {orderModal.show && (
        <div style={S.overlay}>
          <div style={{
            background: '#fff', borderRadius: '12px',
            padding: '36px 40px', minWidth: '400px',
            textAlign: 'left', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h5 style={{ fontWeight: 700, marginBottom: '20px' }}>Place New Order</h5>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Product</label>
              <select 
                className="form-select"
                onChange={handleProductChange}
                value={orderModal.selectedProduct?._id || ''}
              >
                <option value="">-- Choose a Product --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Distributor: {p.distributor_id?.name || 'Global'}) - ₹{p.price.toFixed(2)} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            {orderModal.selectedProduct && (
              <>
                <table style={{ width: '100%', marginBottom: '20px', fontSize: '14px' }}>
                  <tbody>
                    {[
                      ['Category',    orderModal.selectedProduct.category],
                      ['Price',       `₹${Number(orderModal.selectedProduct.price).toFixed(2)}`],
                      ['In Stock',    orderModal.selectedProduct.stock],
                      ['Distributor', orderModal.selectedProduct.distributor_id?.name || 'Global'],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ color: '#888', paddingBottom: '10px', width: '90px' }}>{k}</td>
                        <td style={{ fontWeight: 600, paddingBottom: '10px' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quantity</label>
                <input
                  type="number" min="1"
                  value={quantity}
                  onChange={handleQtyChange}
                  className="form-control"
                  style={{
                    marginBottom: '6px',
                    borderColor: qtyError ? '#dc3545' : '#ced4da',
                    boxShadow: qtyError ? '0 0 0 0.2rem rgba(220,53,69,0.25)' : 'none',
                  }}
                />

                {qtyError && (
                  <div style={{
                    background: '#fff5f5', border: '1px solid #f5c6cb',
                    borderRadius: '6px', padding: '8px 12px',
                    color: '#dc3545', fontSize: '13px',
                    marginBottom: '12px', display: 'flex',
                    alignItems: 'center', gap: '6px',
                  }}>
                    <span>⚠️</span> {qtyError}
                  </div>
                )}

                {!qtyError && quantity >= 1 && (
                  <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
                    Total: <strong style={{ color: '#198754', fontSize: '16px' }}>
                      ₹{(quantity * orderModal.selectedProduct.price).toFixed(2)}
                    </strong>
                  </p>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn btn-secondary"
                onClick={() => { setOrderModal({ show: false, selectedProduct: null }); setQtyError(''); }}>
                Cancel
              </button>
              <button className="btn btn-success"
                onClick={handlePlaceOrder}
                disabled={orderLoading || !orderModal.selectedProduct || !!qtyError || quantity < 1}
                style={{ opacity: (orderLoading || !orderModal.selectedProduct || !!qtyError || quantity < 1) ? 0.6 : 1 }}>
                {orderLoading ? 'Placing…' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginLeft: sidebarW, padding: '32px',
        width: `calc(100vw - ${sidebarW}px)`,
        transition: 'all 0.25s ease', boxSizing: 'border-box',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h4 style={{ fontWeight: 700, fontSize: '26px', margin: 0 }}>My Orders</h4>
        </div>

        {/* Search + Add */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ flex: 1, minWidth: '180px', padding: '10px 16px', fontSize: '14px' }}
            placeholder="Search orders by product name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-success"
            style={{ padding: '10px 24px', whiteSpace: 'nowrap', fontWeight: 600 }}
            onClick={openOrderModal}>
            🛒 Place New Order
          </button>
        </div>

        <div style={{
          background: '#fff', borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'auto',
        }}>
          <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="table-light">
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                {['#','Product','Category','Price','Qty','Total','Status','Distributor','Date','Action'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontWeight: 600, fontSize: '14px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                  No orders found.
                </td></tr>
              ) : currentItems.map((o, i) => {
                const ss = statusStyle(o.status);
                return (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={td}>{indexOfFirstItem + i + 1}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{o.productName}</td>
                    <td style={td}>{o.category}</td>
                    <td style={td}>₹{Number(o.price).toFixed(2)}</td>
                    <td style={td}>{o.quantity}</td>
                    <td style={td}>₹{Number(o.totalPrice).toFixed(2)}</td>
                    <td style={td}>
                      <span style={{
                        background: ss.bg, color: ss.color,
                        padding: '4px 12px', borderRadius: '12px',
                        fontSize: '12px', fontWeight: 600,
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={td}>{o.distributor_id?.name || 'Global'}</td>
                    <td style={td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={td}>
                      {['Pending', 'Processing'].includes(o.status) ? (
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => cancelOrder(o._id)}>
                          Cancel
                        </button>
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
const S = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }
};