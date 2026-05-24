import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import socket from '../socket';

const PRODUCT_BASE = 'http://localhost:5001/api/products';

export default function Suppliers() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [sidebarW, setSidebarW] = useState(220);
  const { toast, showToast, hideToast } = useToast();

  const [orderModal, setOrderModal] = useState({ show: false, product: null });
  const [quantity, setQuantity] = useState(1);
  const [qtyError, setQtyError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem('token');

  // Fetch all products (including supplier-added products)
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${PRODUCT_BASE}?includeSupplierProducts=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch products failed', err);
      showToast('Failed to load products', 'error');
    }
  };

  // Fetch restock orders placed by this admin
  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/orders/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Fetch orders failed', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // Socket.io Real-time Event Listeners
  useEffect(() => {
    const onProductUpdated = (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      setOrderModal(m =>
        m.show && m.product?._id === updatedProduct._id
          ? { ...m, product: updatedProduct } : m
      );
    };
    const onProductAdded = (p) => setProducts(prev => [p, ...prev]);
    const onProductDeleted = ({ _id }) => setProducts(prev => prev.filter(p => p._id !== _id));
    const onOrderUpdated = () => {
      fetchOrders();
    };

    socket.on('product:updated', onProductUpdated);
    socket.on('product:added', onProductAdded);
    socket.on('product:deleted', onProductDeleted);
    socket.on('order:updated', onOrderUpdated);
    socket.on('order:new', onOrderUpdated);

    // Also register order:status listener for this admin to update list
    const userObj = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (userObj.id) {
      socket.on(`order:status:${userObj.id}`, onOrderUpdated);
    }

    return () => {
      socket.off('product:updated', onProductUpdated);
      socket.off('product:added', onProductAdded);
      socket.off('product:deleted', onProductDeleted);
      socket.off('order:updated', onOrderUpdated);
      socket.off('order:new', onOrderUpdated);
      if (userObj.id) {
        socket.off(`order:status:${userObj.id}`, onOrderUpdated);
      }
    };
  }, []);

  const handleOpenOrder = (product) => {
    setQuantity(1000);
    setQtyError('');
    setOrderModal({ show: true, product });
  };

  const handlePlaceOrder = async () => {
    if (quantity < 1000) { setQtyError('Quantity must be at least 1000.'); return; }
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/orders/place',
        { productId: orderModal.product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderModal({ show: false, product: null });
      showToast(`✅ Restock order placed with ${orderModal.product.supplier} for ${orderModal.product.name}!`, 'success');
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Order failed', 'error');
    }
    setLoading(false);
  };

  // Filter out products added by suppliers
  const supplierProducts = products.filter(p => p.addedBySupplier === true);

  const filteredProducts = supplierProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Orders Pagination State
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const ordersPerPage = 5;

  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentOrderPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [products, totalPages]);

  const orderStatusColor = (s) => ({
    Pending:   { bg: '#fef3c7', color: '#92400e' },
    Approved:  { bg: '#d1fae5', color: '#065f46' },
    Rejected:  { bg: '#fee2e2', color: '#991b1b' },
    Cancelled: { bg: '#f3f4f6', color: '#374151' },
  }[s] || { bg: '#f3f4f6', color: '#374151' });

  const stockColor = (qty, minThreshold = 25) => {
    if (qty <= minThreshold)  return { background: '#dc3545', color: '#fff' };
    if (qty <= 80)            return { background: '#ffc107', color: '#000' };
    return                    { background: '#198754', color: '#fff' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar onWidthChange={setSidebarW} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Restock Order Modal */}
      {orderModal.show && orderModal.product && (
        <div style={{ ...styles.overlay, zIndex: 10600 }}>
          <div className="glass-panel" style={{
            padding: '36px 40px', minWidth: '400px',
            textAlign: 'left', background: '#fff', borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h5 style={{ fontWeight: 700, marginBottom: '20px', color: '#333' }}>Place Restock Order</h5>
            <table style={{ width: '100%', marginBottom: '20px', fontSize: '14px' }}>
              <tbody>
                {[
                  ['Product',  orderModal.product.name],
                  ['Category', orderModal.product.category],
                  ['Supplier', orderModal.product.supplier],
                  ['Price',    `₹${Number(orderModal.product.price).toFixed(2)}`],
                  ['Current Stock', orderModal.product.stock],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: '#888', paddingBottom: '10px', width: '110px' }}>{k}</td>
                    <td style={{ fontWeight: 600, paddingBottom: '10px', color: '#111' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', color: '#333' }}>Quantity to Order</label>
            <input
              type="number" min="1000"
              value={quantity}
              onChange={e => {
                const val = Number(e.target.value);
                setQuantity(val);
                if (val < 1000) setQtyError('Quantity must be at least 1000.');
                else setQtyError('');
              }}
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
                Est. Cost: <strong style={{ color: '#cca876', fontSize: '16px' }}>
                  ₹{(quantity * orderModal.product.price).toFixed(2)}
                </strong>
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn btn-secondary"
                onClick={() => { setOrderModal({ show: false, product: null }); setQtyError(''); }}>
                Cancel
              </button>
              <button className="btn btn-success"
                onClick={handlePlaceOrder}
                disabled={loading || !!qtyError || quantity < 1}
                style={{ opacity: (loading || !!qtyError || quantity < 1) ? 0.6 : 1 }}>
                {loading ? 'Placing…' : 'Place Restock Order'}
              </button>
            </div>
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
            Supplier Products Catalog
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
            placeholder="Search supplier products by name, category, or supplier..."
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
          marginBottom: '32px',
        }}>
          <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                <th style={{ ...styles.th, width: '80px' }}>S No</th>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={{ ...styles.th, width: '150px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-5">
                    No supplier products found.
                  </td>
                </tr>
              ) : (
                currentItems.map((prod, i) => (
                  <tr key={prod._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={styles.td}>{indexOfFirstItem + i + 1}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{prod.name}</td>
                    <td style={styles.td}>{prod.category}</td>
                    <td style={styles.td}>₹{Number(prod.price).toFixed(2)}</td>
                    <td style={styles.td}>
                      <button className="btn btn-sm" style={{ background: '#cca876', color: '#fff', fontWeight: 600 }}
                        onClick={() => handleOpenOrder(prod)}>
                        Order Stock
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
                    border: num === currentPage ? '1px solid #cca876' : '1px solid #ddd',
                    background: num === currentPage ? '#cca876' : '#fff',
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

        {/* ── Restock Orders History Section ── */}
        <h4 style={{ fontWeight: '700', fontSize: '24px', color: '#222', marginBottom: '20px', marginTop: '40px' }}>
          Restock Orders History
        </h4>
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
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Total Price</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status Details</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    No restock orders found.
                  </td>
                </tr>
              ) : (
                currentOrders.map((ord, i) => {
                  const sc = orderStatusColor(ord.status);
                  return (
                    <tr key={ord._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={styles.td}>{indexOfFirstOrder + i + 1}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{ord.productName}</td>
                      <td style={styles.td}>{ord.quantity}</td>
                      <td style={styles.td}>₹{Number(ord.totalPrice).toFixed(2)}</td>
                      <td style={styles.td}>
                        <span style={{
                          background: sc.bg, color: sc.color,
                          padding: '4px 12px', borderRadius: '12px',
                          fontSize: '12px', fontWeight: 600
                        }}>{ord.status}</span>
                      </td>
                      <td style={styles.td}>{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        {ord.status === 'Pending' ? (
                          <span style={{ color: '#cca876', fontSize: '13px', fontWeight: 600 }}>Awaiting Supplier Approval</span>
                        ) : ord.status === 'Approved' ? (
                          <span style={{ color: '#198754', fontSize: '13px', fontWeight: 600 }}>Approved by Supplier</span>
                        ) : ord.status === 'Rejected' ? (
                          <span style={{ color: '#dc3545', fontSize: '13px', fontWeight: 600 }}>Rejected by Supplier</span>
                        ) : (
                          <span style={{ color: '#6c757d', fontSize: '13px', fontWeight: 600 }}>Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {totalOrderPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingBottom: '10px' }}>
              <button 
                disabled={currentOrderPage === 1}
                onClick={() => setCurrentOrderPage(prev => Math.max(prev - 1, 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: currentOrderPage === 1 ? '#f5f5f5' : '#fff',
                  cursor: currentOrderPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentOrderPage === 1 ? '#aaa' : '#333',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >&laquo;</button>
              {Array.from({ length: totalOrderPages }, (_, idx) => idx + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentOrderPage(num)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: num === currentOrderPage ? '1px solid #cca876' : '1px solid #ddd',
                    background: num === currentOrderPage ? '#cca876' : '#fff',
                    color: num === currentOrderPage ? '#fff' : '#333',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {num}
                </button>
              ))}
              <button 
                disabled={currentOrderPage === totalOrderPages}
                onClick={() => setCurrentOrderPage(prev => Math.min(prev + 1, totalOrderPages))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: currentOrderPage === totalOrderPages ? '#f5f5f5' : '#fff',
                  cursor: currentOrderPage === totalOrderPages ? 'not-allowed' : 'pointer',
                  color: currentOrderPage === totalOrderPages ? '#aaa' : '#333',
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
