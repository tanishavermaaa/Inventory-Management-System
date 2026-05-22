import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    success: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '✅' },
    error:   { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '❌' },
    info:    { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '10px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      minWidth: '280px', maxWidth: '400px',
      animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: '18px' }}>{c.icon}</span>
      <span style={{ color: c.text, fontWeight: 500, fontSize: '14px', flex: 1 }}>
        {message}
      </span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: c.text, fontSize: '18px', lineHeight: 1,
      }}>×</button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}