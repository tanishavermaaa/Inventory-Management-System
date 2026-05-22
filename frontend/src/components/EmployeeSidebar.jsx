import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaBoxes, FaShoppingCart, FaUserCircle,
  FaSignOutAlt, FaBars, FaChevronLeft,
} from 'react-icons/fa';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import socket from '../socket';

export default function EmployeeSidebar({ onWidthChange }) {
  const navigate = useNavigate();

  const expandedWidth  = 220;
  const collapsedWidth = 60;

  const [width,      setWidth]      = useState(expandedWidth);
  const [collapsed,  setCollapsed]  = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isDragging, setIsDragging] = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const me = JSON.parse(sessionStorage.getItem('user') || '{}');

  const logout = () => { sessionStorage.clear(); navigate('/login'); };

  const toggleCollapsed = () => {
    setCollapsed(c => {
      const newVal = !c;
      localStorage.setItem('sidebar_collapsed', newVal);
      return newVal;
    });
  };

  // Listen for live order status updates
  useEffect(() => {
    if (!me.id) return;
    const onStatusUpdate = (data) => {
      showToast(`🔔 ${data.message}`, data.status === 'Approved' ? 'success' : 'error');
    };
    socket.on(`order:status:${me.id}`, onStatusUpdate);
    return () => {
      socket.off(`order:status:${me.id}`, onStatusUpdate);
    };
  }, [me.id]);

  // ── notify parent ──
  useEffect(() => {
    onWidthChange?.(collapsed ? collapsedWidth : width);
  }, [width, collapsed]);

  // ── auto-collapse below 900px ──
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

  // ── drag to resize ──
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return;
      const nw = e.clientX;
      if (nw >= 160 && nw <= 400) setWidth(nw);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [isDragging]);

  const w = collapsed ? collapsedWidth : width;

  const links = [
    { to: '/employee-dashboard',         icon: <FaBoxes />,        label: 'Products' },
    { to: '/employee-dashboard/orders',  icon: <FaShoppingCart />, label: 'Orders'   },
    { to: '/employee-dashboard/profile', icon: <FaUserCircle />,   label: 'Profile'  },
  ];

  return (
    <div style={{
      width: w, minHeight: '100vh', height: '100vh',
      background: '#1a1a2e', color: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 200,
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
          <div style={{ fontWeight: 700, fontSize: '16px', whiteSpace: 'nowrap' }}>
            Inventory MS
          </div>
        )}
        <div
          onClick={toggleCollapsed}
          style={{
            cursor: 'pointer',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {collapsed ? <FaBars /> : <FaBars />}
        </div>
      </div>

      {/* ── Scrollable nav ──                          ← KEY CHANGE */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',          // ← enables up/down scroll
        overflowX: 'hidden',
        paddingTop: '4px',
        paddingBottom: '4px',
        // hide scrollbar visually but keep it functional
        scrollbarWidth: 'none',
      }}>
        <style>{`nav::-webkit-scrollbar { display: none; }`}</style>

        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            end={l.to === '/employee-dashboard'}
            title={collapsed ? l.label : ''}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '8px 16px',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none', fontSize: '14px',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent',
              whiteSpace: 'nowrap',
            })}>
            <span style={{ fontSize: '17px', flexShrink: 0,
                           marginRight: collapsed ? 0 : '10px' }}>
              {l.icon}
            </span>
            {!collapsed && l.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout pinned to bottom ── */}
      <button onClick={logout} title={collapsed ? 'Logout' : ''}
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '12px 0' : '10px 16px',
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          fontSize: '14px', width: '100%', flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          whiteSpace: 'nowrap',
        }}>
        <span style={{ fontSize: '17px', flexShrink: 0,
                       marginRight: collapsed ? 0 : '10px' }}>
          <FaSignOutAlt />
        </span>
        {!collapsed && 'Logout'}
      </button>

      {/* ── Drag resizer ── */}
      {!collapsed && (
        <div
          onMouseDown={() => setIsDragging(true)}
          style={{
            width: '5px', cursor: 'col-resize',
            background: '#4CAF50',
            position: 'absolute', top: 0, right: 0, bottom: 0,
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}