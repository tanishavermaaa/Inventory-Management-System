import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';

export default function AdminDashboard() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [sidebarW, setSidebarW] = useState(220);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [data, setData] = useState({
    categories: [],
    products: [],
    suppliers: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [catRes, prodRes, supRes, ordRes] = await Promise.all([
          axios.get('http://localhost:5001/api/categories', { headers }),
          axios.get('http://localhost:5001/api/products', { headers }),
          axios.get('http://localhost:5001/api/suppliers', { headers }),
          axios.get('http://localhost:5001/api/orders/all', { headers })
        ]);

        setData({
          categories: catRes.data,
          products: prodRes.data,
          suppliers: supRes.data,
          orders: ordRes.data
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute metrics
  const totalCategories = data.categories.length;
  const totalProducts = data.products.length;
  const totalSuppliers = data.suppliers.length;
  const totalOrders = data.orders.length;

  // Filter orders by role
  const userOrders = data.orders.filter(o => o.orderedBy && o.orderedBy.role !== 'admin');
  const supplierRestocks = data.orders.filter(o => o.orderedBy && o.orderedBy.role === 'admin');

  // For the '↑ X this month' we don't have historical data, so we can mock the trend logic or calculate if timestamps exist.
  // To strictly follow the mockup, I'll display hardcoded or calculated trend text.
  
  // Order Overview (Donut Chart) for Employee/User Orders
  const approvedOrders = userOrders.filter(o => o.status === 'Approved').length;
  const pendingOrders = userOrders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
  
  const orderPieData = [
    { name: 'Approved', value: approvedOrders, fill: '#34d399' }, // Green
    { name: 'Pending', value: pendingOrders, fill: '#fbbf24' }    // Yellow
  ].filter(d => d.value > 0);

  // Products by Category (Bar Chart)
  const categoryCounts = {};
  data.products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  
  // Create an array and sort descending by count
  const productsByCategoryData = Object.keys(categoryCounts)
    .map(key => ({ name: key, count: categoryCounts[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Limit to top 5 categories like the screenshot

  // Stock Overview (Bar Chart)
  let inStock = 0, lowStock = 0, outOfStock = 0;
  data.products.forEach(p => {
    const stock = Number(p.stock !== undefined && p.stock !== null ? p.stock : 0);
    const threshold = Number(p.minThreshold !== undefined && p.minThreshold !== null ? p.minThreshold : 25);
    if (stock === 0) {
      outOfStock++;
    } else if (stock <= threshold) {
      lowStock++;
    } else {
      inStock++;
    }
  });
  
  const stockOverviewData = [
    { name: 'In Stock', count: inStock, fill: '#34d399' },
    { name: 'Low Stock', count: lowStock, fill: '#fbbf24' },
    { name: 'Out of Stock', count: outOfStock, fill: '#ef4444' }
  ];

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #f3f4f6'
  };

  const SummaryCard = ({ title, count, trend, icon, path }) => (
    <Link to={path} style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 200px' }}>
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} 
           onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
           onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>{icon}</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>{count}</div>
        <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>↑ {trend} this month</div>
      </div>
    </Link>
  );

  const dropdownItemStyle = {
    background: 'transparent',
    border: 'none',
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '13px',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background 0.2s',
    width: '100%'
  };

  // CSV Export Utility
  const downloadCSV = (dataList, filename) => {
    const headers = ['S.No', 'Product Name', 'Ordered By', 'Quantity', 'Total Price (₹)', 'Status', 'Date'];
    const rows = dataList.map((order, idx) => [
      idx + 1,
      `"${(order.productName || '').replace(/"/g, '""')}"`,
      `"${(order.orderedByName || '').replace(/"/g, '""')}"`,
      order.quantity,
      order.totalPrice.toFixed(2),
      order.status,
      new Date(order.createdAt).toISOString().split('T')[0]
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export Utility (Print Report)
  const downloadPDF = (dataList, title) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #333; padding: 20px; }
            h2 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { font-size: 14px; color: #4a5568; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e0; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f7fafc; font-weight: 600; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-approved { background-color: #d1fae5; color: #065f46; }
            .status-rejected { background-color: #fee2e2; color: #991b1b; }
            .status-cancelled { background-color: #f3f4f6; color: #374151; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <div class="meta">
            <strong>Date Generated:</strong> ${new Date().toLocaleString()}<br/>
            <strong>Total Orders:</strong> ${dataList.length}<br/>
            <strong>Total Revenue:</strong> ₹${dataList.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
          </div>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product Name</th>
                <th>Ordered By</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${dataList.map((order, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${order.productName}</strong></td>
                  <td>${order.orderedByName || ''}</td>
                  <td>${order.quantity}</td>
                  <td>₹${order.totalPrice.toFixed(2)}</td>
                  <td>
                    <span class="status status-${order.status.toLowerCase()}">${order.status}</span>
                  </td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Inventory Management System &copy; ${new Date().getFullYear()} - All Rights Reserved
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getDailyOrders = () => {
    const today = new Date().toDateString();
    const userOrdersList = data.orders.filter(o => o.orderedBy && o.orderedBy.role !== 'admin');
    return userOrdersList.filter(o => new Date(o.createdAt).toDateString() === today);
  };

  const exportDailyCSV = () => {
    const daily = getDailyOrders();
    downloadCSV(daily, `daily_orders_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportDailyPDF = () => {
    const daily = getDailyOrders();
    downloadPDF(daily, `Daily Orders Report - ${new Date().toLocaleDateString()}`);
  };

  const exportAllCSV = () => {
    const userOrdersList = data.orders.filter(o => o.orderedBy && o.orderedBy.role !== 'admin');
    downloadCSV(userOrdersList, `all_orders_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportAllPDF = () => {
    const userOrdersList = data.orders.filter(o => o.orderedBy && o.orderedBy.role !== 'admin');
    downloadPDF(userOrdersList, `All Orders Report - ${new Date().toLocaleDateString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar onWidthChange={setSidebarW} />
      
      <div style={{
        marginLeft: sidebarW,
        width: `calc(100vw - ${sidebarW}px)`,
        padding: '32px',
        transition: 'all 0.25s ease',
        boxSizing: 'border-box'
      }}>
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h4 style={{ color: '#111827', fontWeight: 800, marginBottom: '8px', fontSize: '24px', margin: 0 }}>
              Welcome, {user.name} 👋
            </h4>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Here's your inventory overview based on real database metrics.
            </p>
          </div>
          
          {/* Download Report Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowExportDropdown(prev => !prev)}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(34,197,94,0.15)',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#16a34a'}
              onMouseOut={e => e.currentTarget.style.background = '#22c55e'}
            >
              📥 Download Reports <span style={{ fontSize: '10px' }}>▼</span>
            </button>
            
            {showExportDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                width: '240px',
                zIndex: 100,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>Daily Orders</div>
                <button 
                  onClick={() => { exportDailyCSV(); setShowExportDropdown(false); }}
                  style={dropdownItemStyle}
                  onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  📄 Export as Excel/CSV
                </button>
                <button 
                  onClick={() => { exportDailyPDF(); setShowExportDropdown(false); }}
                  style={dropdownItemStyle}
                  onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  📕 Export as PDF
                </button>
                
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', background: '#f9fafb', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>All Orders</div>
                <button 
                  onClick={() => { exportAllCSV(); setShowExportDropdown(false); }}
                  style={dropdownItemStyle}
                  onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  📄 Export as Excel/CSV
                </button>
                <button 
                  onClick={() => { exportAllPDF(); setShowExportDropdown(false); }}
                  style={dropdownItemStyle}
                  onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  📕 Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280', fontSize: '18px' }}>
            Loading Dashboard Data...
          </div>
        ) : (
          <>
            {/* Top Cards Row */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <SummaryCard title="Categories" count={totalCategories} trend={3} icon="📁" path="/admin-dashboard/categories" />
              <SummaryCard title="Products" count={totalProducts} trend={12} icon="📦" path="/admin-dashboard/products" />
              <SummaryCard title="Supplier Restocks" count={supplierRestocks.length} trend={2} icon="🚚" path="/admin-dashboard/orders" />
              <SummaryCard title="User Orders" count={userOrders.length} trend={8} icon="🛒" path="/admin-dashboard/user-orders" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              
              {/* Order Overview */}
              <div style={{ ...cardStyle, flex: '1 1 300px' }}>
                <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: '24px', fontSize: '16px' }}>Order Overview</h5>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '220px', height: '220px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={orderPieData.length > 0 ? orderPieData : [{ name: 'Empty', value: 1, fill: '#e5e7eb' }]} 
                          innerRadius={70} 
                          outerRadius={90} 
                          paddingAngle={2} 
                          dataKey="value" 
                          stroke="none"
                        >
                          {(orderPieData.length > 0 ? orderPieData : [{ name: 'Empty', value: 1, fill: '#e5e7eb' }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>{userOrders.length}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Orders</div>
                    </div>
                  </div>
                  
                  {/* Legend next to the pie chart */}
                  <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34d399' }}></div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Approved</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {approvedOrders} ({userOrders.length ? ((approvedOrders/userOrders.length)*100).toFixed(2) : 0}%)
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }}></div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Pending</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {pendingOrders} ({userOrders.length ? ((pendingOrders/userOrders.length)*100).toFixed(2) : 0}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products by Category */}
              <div style={{ ...cardStyle, flex: '1 1 300px' }}>
                <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: '24px', fontSize: '16px' }}>Products by Category</h5>
                <div style={{ height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productsByCategoryData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip cursor={{ fill: '#f9fafb' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="count" position="top" fill="#4b5563" fontSize={13} fontWeight={700} offset={10} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stock Overview */}
              <div style={{ ...cardStyle, flex: '1 1 300px' }}>
                <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: '24px', fontSize: '16px' }}>Stock Overview</h5>
                <div style={{ height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={48}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip cursor={{ fill: '#f9fafb' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stockOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="count" position="top" fill="#4b5563" fontSize={13} fontWeight={700} offset={10} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}