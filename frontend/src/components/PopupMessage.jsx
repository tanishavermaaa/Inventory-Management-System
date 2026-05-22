export default function PopupMessage({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={overlay}>
      <div style={box}>
        <p style={{ marginBottom: '20px', fontSize: '15px' }}>{message}</p>
        <button onClick={onClose} style={btn}>OK</button>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
};
const box = {
  background: '#fff', borderRadius: '8px', padding: '30px 40px',
  minWidth: '280px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
};
const btn = {
  background: '#0d6efd', color: '#fff', border: 'none',
  borderRadius: '6px', padding: '8px 30px', cursor: 'pointer', fontSize: '15px',
};