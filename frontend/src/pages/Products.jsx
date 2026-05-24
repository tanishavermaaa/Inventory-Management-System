// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import Sidebar from '../components/Sidebar';

// const BASE = 'http://localhost:5001/api/products';

// export default function Products() {
//   const [products,  setProducts]  = useState([]);
//   const [search,    setSearch]    = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editId,    setEditId]    = useState(null);
//   const [loading,   setLoading]   = useState(false);
//   const [popup,     setPopup]     = useState({ show: false, message: '' });
//   const [sidebarW, setSidebarW] = useState(220);
//   const [form, setForm] = useState({
//     name: '', category: '', supplier: '', price: '', stock: ''
//   });

//   const showPopup  = (msg) => setPopup({ show: true,  message: msg });
//   const closePopup = ()    => setPopup({ show: false, message: '' });

//   /* ── fetch ── */
//   const fetchProducts = async (q = '') => {
//     try {
//       const res = await axios.get(`${BASE}?search=${q}`);
//       setProducts(res.data);
//     } catch (err) {
//       console.error('Fetch error:', err.message);
//     }
//   };

//   useEffect(() => { fetchProducts(); }, []);

//   /* ── search ── */
//   const handleSearch = (e) => {
//     setSearch(e.target.value);
//     fetchProducts(e.target.value);
//   };

//   /* ── open modal ── */
//   const openAddModal = () => {
//     setEditId(null);
//     setForm({ name: '', category: '', supplier: '', price: '', stock: '' });
//     setShowModal(true);
//   };

//   const openEditModal = (product) => {
//     setEditId(product._id);
//     setForm({
//       name:     product.name,
//       category: product.category,
//       supplier: product.supplier,
//       price:    product.price,
//       stock:    product.stock,
//     });
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditId(null);
//     setForm({ name: '', category: '', supplier: '', price: '', stock: '' });
//   };

//   /* ── submit ── */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (editId) {
//         await axios.put(`${BASE}/${editId}`, form);
//         showPopup('Product Updated Successfully!');
//       } else {
//         await axios.post(`${BASE}/add`, form);
//         showPopup('Product Added Successfully!');
//       }
//       closeModal();
//       fetchProducts(search);
//     } catch (err) {
//       showPopup(err.response?.data?.message || 'Something went wrong');
//     }
//     setLoading(false);
//   };

//   /* ── delete ── */
//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this product?')) return;
//     try {
//       await axios.delete(`${BASE}/${id}`);
//       showPopup('Product Deleted Successfully!');
//       fetchProducts(search);
//     } catch (err) {
//       showPopup(err.response?.data?.message || 'Delete failed');
//     }
//   };

//   /* ── stock badge color ── */
//   const stockColor = (qty) => {
//     if (qty === 0)  return { background: '#dc3545', color: '#fff' };
//     if (qty <= 5)   return { background: '#fd7e14', color: '#fff' };
//     if (qty <= 15)  return { background: '#ffc107', color: '#000' };
//     return              { background: '#198754', color: '#fff' };
//   };

//   /* ════════════════════════════════════════ */
//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>

//       <Sidebar onWidthChange={setSidebarW}/>

//       {/* ── Popup ── */}
//       {popup.show && (
//         <div style={S.overlay}>
//           <div style={S.modal}>
//             <p style={{ fontSize: '15px', color: '#333', marginBottom: '20px' }}>
//               {popup.message}
//             </p>
//             <button onClick={closePopup} style={S.okBtn}>OK</button>
//           </div>
//         </div>
//       )}

//       {/* ── Add/Edit Modal ── */}
//       {showModal && (
//         <div style={S.overlay}>
//           <div style={{
//               ...S.modal,
//              minWidth: '420px',
//              textAlign: 'left',
//              maxHeight: '90vh',
//              overflowY: 'auto',
//   }}>
//             <h5 style={{ marginBottom: '20px', fontWeight: 700 }}>
//               {editId ? 'Edit Product' : 'Add Product'}
//             </h5>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label className="form-label fw-semibold">Product Name</label>
//                 <input className="form-control" placeholder="e.g. Mouse"
//                   value={form.name}
//                   onChange={e => setForm({ ...form, name: e.target.value })}
//                   required />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label fw-semibold">Category</label>
//                 <input className="form-control" placeholder="e.g. Tech"
//                   value={form.category}
//                   onChange={e => setForm({ ...form, category: e.target.value })}
//                   required />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label fw-semibold">Supplier</label>
//                 <input className="form-control" placeholder="e.g. HP Group"
//                   value={form.supplier}
//                   onChange={e => setForm({ ...form, supplier: e.target.value })}
//                   required />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label fw-semibold">Price ($)</label>
//                 <input className="form-control" type="number" min="0" step="0.01"
//                   placeholder="e.g. 10.00"
//                   value={form.price}
//                   onChange={e => setForm({ ...form, price: e.target.value })}
//                   required />
//               </div>
//               <div className="mb-4">
//                 <label className="form-label fw-semibold">Stock Quantity</label>
//                 <input className="form-control" type="number" min="0"
//                   placeholder="e.g. 20"
//                   value={form.stock}
//                   onChange={e => setForm({ ...form, stock: e.target.value })}
//                   required />
//               </div>

//               <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//                 <button type="button" className="btn btn-secondary"
//                   onClick={closeModal}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving…' : editId ? 'Update Product' : 'Add Product'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ── Main Content ── */}
//    <div style={{
//   marginLeft: sidebarW,
//   padding: '32px',
//   transition: 'margin-left 0.25s ease',
//   boxSizing: 'border-box',       // ← ADD
//   width: `calc(100vw - ${sidebarW}px)`,  // ← CHANGE: was flex:1, now explicit vw calc
//   minWidth: 0,
// }}>

//         <h4 style={{ fontWeight: 700, marginBottom: '24px' }}>Products</h4>

//         {/* ── Search + Add button row ── */}
//         <div style={{
//           display: 'flex',
// gap: '12px',
// flexWrap: 'wrap',
//           marginBottom: '20px', alignItems: 'center'
//         }}>
//           <input
//             className="form-control"
//             style={{ flex: 1, padding: '10px 16px', fontSize: '14px' }}
//             placeholder="Search products by name..."
//             value={search}
//             onChange={handleSearch}
//           />
//           <button
//             className="btn btn-primary"
//             style={{ padding: '10px 24px', whiteSpace: 'nowrap', fontWeight: 600 }}
//             onClick={openAddModal}
//           >
//             + Add Product
//           </button>
//         </div>

//         {/* ── Table ── */}
//         <div style={{
//           background: '#fff', borderRadius: '8px',
//           boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'auto'
//         }}>
//           <table className="table mb-0" style={{ borderCollapse: 'collapse' }}>
//             <thead>
//               <tr style={{ borderBottom: '2px solid #dee2e6' }}>
//                 {['Name','Category','Supplier','Price','Stock','Action'].map(h => (
//                   <th key={h} style={S.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {products.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
//                     No products found. Click <strong>+ Add Product</strong> to get started.
//                   </td>
//                 </tr>
//               ) : products.map(p => (
//                 <tr key={p._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
//                   <td style={S.td}>{p.name}</td>
//                   <td style={S.td}>{p.category}</td>
//                   <td style={S.td}>{p.supplier}</td>
//                   <td style={S.td}>${Number(p.price).toFixed(2)}</td>
//                   <td style={S.td}>
//                     <span style={{
//                       ...stockColor(p.stock),
//                       borderRadius: '50%',
//                       width: '32px', height: '32px',
//                       display: 'inline-flex',
//                       alignItems: 'center', justifyContent: 'center',
//                       fontWeight: 700, fontSize: '13px'
//                     }}>
//                       {p.stock}
//                     </span>
//                   </td>
//                   <td style={S.td}>
//                     <button
//                       style={{ background: 'none', border: 'none', color: '#0d6efd',
//                                fontWeight: 600, cursor: 'pointer', marginRight: '12px' }}
//                       onClick={() => openEditModal(p)}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       style={{ background: 'none', border: 'none', color: '#dc3545',
//                                fontWeight: 600, cursor: 'pointer' }}
//                       onClick={() => handleDelete(p._id)}
//                     >
//                       Delete
//                     </button>
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

// /* ── Shared styles ── */
// const S = {
//   th: {
//     padding: '14px 16px', fontWeight: 600,
//     fontSize: '14px', color: '#333',
//     background: '#fff',
//   },
//   td: {
//     padding: '14px 16px', fontSize: '14px',
//     color: '#333', verticalAlign: 'middle',
//   },
//   overlay: {
//     position: 'fixed', inset: 0,
//     background: 'rgba(0,0,0,0.45)',
//     display: 'flex', alignItems: 'center',
//     justifyContent: 'center', zIndex: 9999,
//   },
//   modal: {
//     background: '#fff', borderRadius: '10px',
//     padding: '36px 40px', minWidth: '300px',
//     textAlign: 'center',
//     boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
//   },
//   okBtn: {
//     background: '#0d6efd', color: '#fff',
//     border: 'none', borderRadius: '6px',
//     padding: '8px 36px', fontSize: '15px', cursor: 'pointer',
//   },
// };

// import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import socket from '../socket';
import { useState, useEffect, useRef } from 'react';
const BASE = 'http://localhost:5001/api/products';

export default function Products() {
  const [products,  setProducts]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [popup,     setPopup]     = useState({ show: false, message: '' });
  const [sidebarW,  setSidebarW]  = useState(220);
  const [form, setForm] = useState({
    name: '', category: '', supplier: 'HP Group', price: '', stock: '', minThreshold: 25
  });
  
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [products, totalPages]);

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showPopup  = (msg) => setPopup({ show: true,  message: msg });
  const closePopup = ()    => setPopup({ show: false, message: '' });

  const fetchProducts = async (q = '') => {
    try {
      const res = await axios.get(`${BASE}?search=${q}`, { headers });
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/categories', { headers });
      setCategories(res.data);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchCategories();
  }, []);

 

// REPLACE the socket useEffect with this:
useEffect(() => {
  // Use a ref flag to prevent double-registration in dev mode
  const onUpdated = (updatedProduct) => {
    console.log('📦 ADMIN received update:', updatedProduct.name, updatedProduct.stock);
    setProducts(prev => {
      const exists = prev.some(p => p._id === updatedProduct._id);
      if (!exists) {
        const loggedInUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        const distId = updatedProduct.distributor_id && typeof updatedProduct.distributor_id === 'object'
          ? updatedProduct.distributor_id._id
          : updatedProduct.distributor_id;
        if (distId && distId === loggedInUser.id) {
          return [{ ...updatedProduct }, ...prev];
        }
        return prev;
      }
      const updated = prev.map(p =>
        p._id === updatedProduct._id ? { ...updatedProduct } : p
      );
      return [...updated];
    });
  };

  const onAdded   = (p) => setProducts(prev => [{ ...p }, ...prev]);
  const onDeleted = ({ _id }) => setProducts(prev => prev.filter(p => p._id !== _id));

  // Remove any existing listeners first before adding new ones
  socket.off('product:updated');
  socket.off('product:added');
  socket.off('product:deleted');

  // Then add fresh listeners
  socket.on('product:updated', onUpdated);
  socket.on('product:added',   onAdded);
  socket.on('product:deleted', onDeleted);

  return () => {
    socket.off('product:updated', onUpdated);
    socket.off('product:added',   onAdded);
    socket.off('product:deleted', onDeleted);
  };
}, []);
  // ← empty deps: register once only

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchProducts(e.target.value);
  };

  const openAddModal = () => {
    setEditId(null);
    setForm({ name: '', category: '', supplier: 'HP Group', price: '', stock: '', minThreshold: 25 });
    setIsNewCategory(false);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditId(product._id);
    setForm({
      name:     product.name,
      category: product.category,
      supplier: product.supplier || 'HP Group',
      price:    product.price,
      stock:    product.stock,
      minThreshold: product.minThreshold || 25,
    });
    setIsNewCategory(false);
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ name: '', category: '', supplier: 'HP Group', price: '', stock: '', minThreshold: 25 });
    setIsNewCategory(false);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!form.name.trim()) errors.name = 'Product Name is required';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) errors.price = 'Valid price is required';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) errors.stock = 'Valid stock quantity is required';
    if (form.minThreshold === '' || isNaN(form.minThreshold) || Number(form.minThreshold) < 0) errors.minThreshold = 'Valid minimum threshold is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      if (isNewCategory) {
        try {
          await axios.post('http://localhost:5001/api/categories/add', { categoryName: form.category, categoryDescription: form.category }, { headers });
          fetchCategories(); // Refresh categories
        } catch (err) {
          // Ignore if category already exists
        }
      }

      console.log('Submitting product form:', form);
      if (editId) {
        const res = await axios.put(`${BASE}/${editId}`, form, { headers });
        console.log('Product updated response:', res.data);
        showPopup('Product Updated Successfully!');
      } else {
        const res = await axios.post(`${BASE}/add`, form, { headers });
        console.log('Product added response:', res.data);
        showPopup('Product Added Successfully!');
      }
      closeModal();
      fetchProducts(search);
    } catch (err) {
      console.error('Submit error details:', err);
      showPopup(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${BASE}/${id}`, { headers });
      showPopup('Product Deleted Successfully!');
      fetchProducts(search);
    } catch (err) {
      showPopup(err.response?.data?.message || 'Delete failed');
    }
  };

  const stockColor = (qty, minThreshold = 25) => {
    if (qty <= minThreshold)  return { background: '#dc3545', color: '#fff' };
    if (qty <= 80)            return { background: '#ffc107', color: '#000' };
    return                    { background: '#198754', color: '#fff' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      <Sidebar onWidthChange={setSidebarW} />



      {/* Popup */}
      {popup.show && (
        <div style={{ ...S.overlay, zIndex: 10500 }}>
          <div style={S.modal}>
            <p style={{ fontSize: '15px', color: '#333', marginBottom: '20px' }}>
              {popup.message}
            </p>
            <button onClick={closePopup} style={S.okBtn}>OK</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={S.overlay}>
          <div style={{
            ...S.modal, minWidth: '420px',
            textAlign: 'left', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h5 style={{ marginBottom: '20px', fontWeight: 700 }}>
              {editId ? 'Edit Product' : 'Add Product'}
            </h5>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label fw-semibold">Product Name <span className="text-danger">*</span></label>
                <input className={`form-control ${formErrors.name ? 'border-danger' : ''}`} placeholder="e.g. Mouse"
                  value={form.name}
                  onChange={e => {
                    setForm({ ...form, name: e.target.value });
                    if(e.target.value.trim()) setFormErrors(prev => ({...prev, name: ''}));
                  }}
                   />
                {formErrors.name && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Category <span className="text-danger">*</span></label>
                {!isNewCategory ? (
                  <select className={`form-select form-control ${formErrors.category ? 'border-danger' : ''}`}
                    value={form.category}
                    onChange={e => {
                      if (e.target.value === '___NEW___') {
                        setIsNewCategory(true);
                        setForm({ ...form, category: '' });
                      } else {
                        setForm({ ...form, category: e.target.value });
                        if(e.target.value.trim()) setFormErrors(prev => ({...prev, category: ''}));
                      }
                    }}
                    
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c._id || c.categoryName} value={c.categoryName}>{c.categoryName}</option>)}
                    <option value="___NEW___" style={{fontWeight: 'bold', color: '#0d6efd'}}>+ Add New Category</option>
                  </select>
                ) : (
                  <div>
                    <input className={`form-control ${formErrors.category ? 'border-danger' : ''}`} placeholder="Enter new category name"
                      value={form.category}
                      onChange={e => {
                        setForm({ ...form, category: e.target.value });
                        if(e.target.value.trim()) setFormErrors(prev => ({...prev, category: ''}));
                      }}
                       autoFocus />
                    <button type="button" className="btn btn-link p-0 mt-1" style={{fontSize: '0.85em', textDecoration: 'none'}}
                      onClick={() => {
                        setIsNewCategory(false);
                        setForm({ ...form, category: '' });
                        setFormErrors(prev => ({...prev, category: ''}));
                      }}>Cancel</button>
                  </div>
                )}
                {formErrors.category && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.category}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Price (₹) <span className="text-danger">*</span></label>
                <input className={`form-control ${formErrors.price ? 'border-danger' : ''}`} type="number" min="0" step="0.01"
                  placeholder="e.g. 10.00"
                  value={form.price}
                  onChange={e => {
                    setForm({ ...form, price: e.target.value });
                    if(e.target.value !== '') setFormErrors(prev => ({...prev, price: ''}));
                  }}
                  />
                {formErrors.price && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.price}</div>}
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Stock Quantity <span className="text-danger">*</span></label>
                <input className={`form-control ${formErrors.stock ? 'border-danger' : ''}`} type="number" min="0"
                  placeholder="e.g. 20"
                  value={form.stock}
                  onChange={e => {
                    setForm({ ...form, stock: e.target.value });
                    if(e.target.value !== '') setFormErrors(prev => ({...prev, stock: ''}));
                  }}
                  />
                {formErrors.stock && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.stock}</div>}
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Minimum Threshold Value (for stock alert) <span className="text-danger">*</span></label>
                <input className={`form-control ${formErrors.minThreshold ? 'border-danger' : ''}`} type="number" min="0"
                  placeholder="e.g. 25"
                  value={form.minThreshold}
                  onChange={e => {
                    setForm({ ...form, minThreshold: e.target.value });
                    if(e.target.value !== '') setFormErrors(prev => ({...prev, minThreshold: ''}));
                  }}
                  />
                {formErrors.minThreshold && <div style={{color:'#dc3545', fontSize:'0.875em', marginTop:'0.25rem'}}>{formErrors.minThreshold}</div>}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary"
                  onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : editId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        marginLeft:  sidebarW,
        padding:     '32px',
        width:       `calc(100vw - ${sidebarW}px)`,
        transition:  'margin-left 0.25s ease, width 0.25s ease',
        boxSizing:   'border-box',
        minWidth:    0,
      }}>

        {/* Header with Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: '24px' }}>
          <h4 style={{ fontWeight: 700, margin: 0 , color:'black'}}>Product Management</h4>
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

        {/* Search + Add */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap',
                      marginBottom: '20px', alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ flex: 1, padding: '10px 16px', fontSize: '14px' }}
            placeholder="Search products by name..."
            value={search}
            onChange={handleSearch}
          />
          <button className="btn btn-primary"
            style={{ padding: '10px 24px', whiteSpace: 'nowrap', fontWeight: 600 }}
            onClick={openAddModal}>
            + Add Product
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff', borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          overflowX: 'auto', width: '100%',
        }}>
          <table className="table mb-0"
            style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                {['Name','Category','Price','Stock','Action'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                    No products found. Click <strong>+ Add Product</strong> to get started.
                  </td>
                </tr>
              ) : currentItems.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={S.td}>{p.name}</td>
                  <td style={S.td}>{p.category}</td>
                  <td style={S.td}>₹{Number(p.price).toFixed(2)}</td>
                  <td style={S.td}>
                    <span style={{
                      ...stockColor(p.stock, p.minThreshold),
                      borderRadius: '50%', width: '32px', height: '32px',
                      display: 'inline-flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700, fontSize: '13px',
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button style={{ background: 'none', border: 'none', color: '#0d6efd',
                                     fontWeight: 600, cursor: 'pointer', marginRight: '12px' }}
                      onClick={() => openEditModal(p)}>Edit</button>
                    <button style={{ background: 'none', border: 'none', color: '#dc3545',
                                     fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleDelete(p._id)}>Delete</button>
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
  th:      { padding: '14px 16px', fontWeight: 600, fontSize: '14px', color: '#333', background: '#fff' },
  td:      { padding: '14px 16px', fontSize: '14px', color: '#333', verticalAlign: 'middle' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal:   { background: '#fff', borderRadius: '10px', padding: '36px 40px',
             minWidth: '300px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  okBtn:   { background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px',
             padding: '8px 36px', fontSize: '15px', cursor: 'pointer' },
};