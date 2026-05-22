

import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaThLarge, FaBoxes,
  FaTruck, FaShoppingCart, FaUsers,
  FaUserCircle, FaSignOutAlt
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';
import useToast from '../hooks/useToast';

export default function Sidebar({ onWidthChange }) {
  const navigate = useNavigate();

  const expandedWidth  = 220;
  const collapsedWidth = 60;

  const [width,      setWidth]      = useState(expandedWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsed,  setCollapsed]  = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const { toast, showToast, hideToast } = useToast();

  const logout = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/admin-count');
      if (res.data.count <= 1) {
        showToast('🚫 Cannot logout: You are the sole administrator. Designate another admin first.', 'error');
        return;
      }
      sessionStorage.clear();
      navigate('/login');
    } catch {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(c => {
      const newVal = !c;
      localStorage.setItem('sidebar_collapsed', newVal);
      return newVal;
    });
  };

  // notify parent of width changes
  useEffect(() => {
    onWidthChange?.(collapsed ? collapsedWidth : width);
  }, [width, collapsed]);

  // auto-collapse below 900px
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 900) {
        setCollapsed(true);
      } else {
        setCollapsed(localStorage.getItem('sidebar_collapsed') === 'true');
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // drag to resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = e.clientX;
      if (newWidth >= 160 && newWidth <= 400) {
        setWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup',   handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup',   handleMouseUp);
    };
  }, [isDragging]);

  const links = [
    { to: '/admin-dashboard',            icon: <FaTachometerAlt />, label: 'Dashboard'  },
    { to: '/admin-dashboard/categories', icon: <FaThLarge />,       label: 'Categories' },
    { to: '/admin-dashboard/products',   icon: <FaBoxes />,         label: 'Products'   },
    { to: '/admin-dashboard/suppliers',  icon: <FaTruck />,         label: 'Suppliers'  },
    { to: '/admin-dashboard/orders',     icon: <FaShoppingCart />,  label: 'Orders'     },
    { to: '/admin-dashboard/users',      icon: <FaUsers />,         label: 'Users'      },
    { to: '/admin-dashboard/profile',    icon: <FaUserCircle />,    label: 'Profile'    },
  ];

  const w = collapsed ? collapsedWidth : width;

  return (
    <div style={{
      width: w,
      minHeight: '100vh',
      height: '100vh',
      background: '#1a1a2e',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 200,
      transition: isDragging ? 'none' : 'width 0.25s ease',
      overflow: 'hidden',
    }}>

      {/* ── Brand & Toggle ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ fontWeight: 700, fontSize: '18px', whiteSpace: 'nowrap' }}>
            Inventory MS
          </div>
        )}
        <div
          onClick={toggleCollapsed}
          style={{
            cursor: 'pointer',
            fontSize: '20px',
            color: 'rgba(255,255,255,0.85)',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ☰
        </div>
      </div>

      {/* ── Scrollable nav ── */}
      <nav style={{
        flex:           1,
        overflowY:      'auto',
        overflowX:      'hidden',
        paddingTop:     '4px',
        paddingBottom:  '4px',
        scrollbarWidth: 'none',         // Firefox
        display:        'flex',
        flexDirection:  'column',
      }}>
        <style>{`
          .sidebar-nav::-webkit-scrollbar { display: none; }
        `}</style>

        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin-dashboard'}
            title={collapsed ? link.label : ''}
            style={({ isActive }) => ({
              display:         'flex',
              alignItems:      'center',
              justifyContent:  collapsed ? 'center' : 'flex-start',
              padding:         collapsed ? '10px 0' : '8px 16px',
              color:           isActive ? '#fff' : 'rgba(255,255,255,0.75)',
              textDecoration:  'none',
              fontSize:        '14px',
              background:      isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderLeft:      isActive ? '3px solid #4CAF50' : '3px solid transparent',
              whiteSpace:      'nowrap',
              transition:      'background 0.15s',
            })}
          >
            <span style={{
              fontSize:    '17px',
              flexShrink:  0,
              marginRight: collapsed ? '0' : '10px',
            }}>
              {link.icon}
            </span>
            {!collapsed && link.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout pinned to bottom ── */}
      <button
        onClick={logout}
        title={collapsed ? 'Logout' : ''}
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  collapsed ? 'center' : 'flex-start',
          padding:         collapsed ? '12px 0' : '10px 16px',
          background:      'none',
          border:          'none',
          borderTop:       '1px solid rgba(255,255,255,0.08)',
          color:           'rgba(255,255,255,0.75)',
          cursor:          'pointer',
          fontSize:        '14px',
          width:           '100%',
          flexShrink:      0,
          whiteSpace:      'nowrap',
        }}
      >
        <span style={{
          fontSize:    '17px',
          flexShrink:  0,
          marginRight: collapsed ? '0' : '10px',
        }}>
          <FaSignOutAlt />
        </span>
        {!collapsed && 'Logout'}
      </button>

      {/* ── Drag resizer ── */}
      {!collapsed && (
        <div
          onMouseDown={() => setIsDragging(true)}
          style={{
            width:    '5px',
            cursor:   'col-resize',
            background: '#4CAF50',
            position: 'absolute',
            top: 0, right: 0, bottom: 0,
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}