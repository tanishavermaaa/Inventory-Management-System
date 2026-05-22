

import { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeSidebar from '../components/EmployeeSidebar';
import socket from '../socket';

const PROD_URL  = 'http://localhost:5001/api/products';
const ORDER_URL = 'http://localhost:5001/api/orders';

export default function EmployeeDashboard() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [selCat,     setSelCat]     = useState('');
  const [search,     setSearch]     = useState('');
  const [popup,      setPopup]      = useState({ show: false, message: '' });
  const [orderModal, setOrderModal] = useState({ show: false, product: null });
  const [quantity,   setQuantity]   = useState(1);
  const [qtyError,   setQtyError]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [sidebarW,   setSidebarW]   = useState(220);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selCat]);

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [products, totalPages]);

  const token   = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showPopup  = (msg) => setPopup({ show: true,  message: msg });
  const closePopup = ()    => setPopup({ show: false, message: '' });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${PROD_URL}?search=${search}`);
      let data = res.data;
      if (selCat) data = data.filter(p => p.category === selCat);
      setProducts(data);
      const allCats = [...new Set(res.data.map(p => p.category))];
      setCategories(allCats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, selCat]);

  useEffect(() => {
    socket.on('product:added', (newProduct) => {
      setProducts(prev => {
        if (prev.some(p => p._id === newProduct._id)) return prev;
        const matchesSearch = newProduct.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = !selCat || newProduct.category === selCat;
        const updated = (matchesSearch && matchesCat) ? [newProduct, ...prev] : prev;
        setCategories(cats => [...new Set([...cats, newProduct.category])]);
        return updated;
      });
    });
    socket.on('product:updated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      setOrderModal(m =>
        m.show && m.product?._id === updatedProduct._id
          ? { ...m, product: updatedProduct } : m
      );
    });
    socket.on('product:deleted', ({ _id }) => {
      setProducts(prev => prev.filter(p => p._id !== _id));
      setOrderModal(m => m.show && m.product?._id === _id ? { show: false, product: null } : m);
    });
    return () => {
      socket.off('product:added');
      socket.off('product:updated');
      socket.off('product:deleted');
    };
  }, [search, selCat]);

  const openOrder = (product) => {
    if (product.stock === 0) { showPopup('This product is out of stock!'); return; }
    setQuantity(1);
    setQtyError('');
    setOrderModal({ show: true, product });
  };

  const handleQtyChange = (e) => {
    const val = Number(e.target.value);
    setQuantity(val);
    if (val < 1) {
      setQtyError('Quantity must be at least 1.');
    } else if (val > orderModal.product.stock) {
      setQtyError(`Only ${orderModal.product.stock} units available in stock!`);
    } else {
      setQtyError('');
    }
  };

  const handleOrder = async () => {
    if (quantity < 1) { setQtyError('Quantity must be at least 1.'); return; }
    if (quantity > orderModal.product.stock) {
      setQtyError(`Only ${orderModal.product.stock} units available in stock!`);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${ORDER_URL}/place`,
        { productId: orderModal.product._id, quantity },
        { headers }
      );
      setOrderModal({ show: false, product: null });
      showPopup(`✅ Order placed for ${orderModal.product.name}!`);
      fetchProducts();
    } catch (err) {
      showPopup(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      <EmployeeSidebar onWidthChange={setSidebarW} />

      {/* Success Popup */}
      {popup.show && (
        <div style={{ ...S.overlay, zIndex: 10500 }}>
          <div style={S.modal}>
            <p style={{ fontSize: '15px', color: '#333', marginBottom: '20px' }}>{popup.message}</p>
            <button onClick={closePopup} style={S.okBtn}>OK</button>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderModal.show && orderModal.product && (
        <div style={S.overlay}>
          <div className="glass-panel" style={{
            padding: '36px 40px', minWidth: '400px',
            textAlign: 'left',
          }}>
            <h5 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Place Order</h5>
            <table style={{ width: '100%', marginBottom: '20px', fontSize: '14px' }}>
              <tbody>
                {[
                  ['Product',  orderModal.product.name],
                  ['Category', orderModal.product.category],
                  ['Price',    `$${Number(orderModal.product.price).toFixed(2)}`],
                  ['In Stock', orderModal.product.stock],
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
                  ${(quantity * orderModal.product.price).toFixed(2)}
                </strong>
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn btn-secondary"
                onClick={() => { setOrderModal({ show: false, product: null }); setQtyError(''); }}>
                Cancel
              </button>
              <button className="btn btn-success"
                onClick={handleOrder}
                disabled={loading || !!qtyError || quantity < 1}
                style={{ opacity: (loading || !!qtyError || quantity < 1) ? 0.6 : 1 }}>
                {loading ? 'Placing…' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: main content uses marginLeft + 100vw calc */}
      <div style={{
        marginLeft:  sidebarW,
        padding:     '32px',
        width:       `calc(100vw - ${sidebarW}px)`,
        transition:  'margin-left 0.25s ease, width 0.25s ease',
        boxSizing:   'border-box',
        minWidth:    0,
      }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: '24px' }}>
          <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Products</h4>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px',
                         fontSize: '12px', color: '#198754', fontWeight: 600 }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#198754', display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }} />
            Live
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-select" style={{ width: '200px' }}
            value={selCat} onChange={e => setSelCat(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="form-control" style={{ flex: 1, minWidth: '180px' }}
            placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table — FIXED: width 100%, no overflow hidden */}
        <div className="glass-panel" style={{
          overflowX: 'auto',
          width: '100%',
        }}>
          <table className="table mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {['ID', 'Name', 'Category', 'Price', 'Stock', 'Action'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                    No products available.
                  </td>
                </tr>
              ) : currentItems.map((p, i) => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={S.td}>{indexOfFirstItem + i + 1}</td>
                  <td style={S.td}>{p.name}</td>
                  <td style={S.td}>{p.category}</td>
                  <td style={S.td}>${Number(p.price).toFixed(2)}</td>
                  <td style={S.td}>
                    <span style={{
                      background: p.stock === 0 ? '#dc3545'
                                : p.stock <= 5  ? '#fd7e14'
                                : p.stock <= 15 ? '#ffc107' : '#198754',
                      color: (p.stock > 5 && p.stock <= 15) ? '#000' : '#fff',
                      borderRadius: '50%', width: '32px', height: '32px',
                      display: 'inline-flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700, fontSize: '13px',
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button onClick={() => openOrder(p)} style={{
                      background: p.stock === 0 ? '#adb5bd' : '#198754',
                      color: '#fff', border: 'none', borderRadius: '4px',
                      padding: '6px 18px', fontWeight: 600,
                      cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                    }}>
                      Order
                    </button>
                  </td>
                </tr>
              ))}
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
                  border: '1px solid var(--border-color)',
                  background: currentPage === 1 ? 'var(--surface-dark)' : 'var(--surface-light)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
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
                    border: num === currentPage ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: num === currentPage ? 'var(--accent-primary)' : 'var(--surface-light)',
                    color: num === currentPage ? '#fff' : 'var(--text-primary)',
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
                  border: '1px solid var(--border-color)',
                  background: currentPage === totalPages ? 'var(--surface-dark)' : 'var(--surface-light)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >&raquo;</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

const S = {
  th:      { padding: '14px 16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' },
  td:      { padding: '14px 16px', fontSize: '14px', color: 'var(--text-secondary)', verticalAlign: 'middle' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal:   { background: '#fff', borderRadius: '10px', padding: '36px 40px',
             minWidth: '300px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  okBtn:   { background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px',
             padding: '8px 36px', fontSize: '15px', cursor: 'pointer' },
};