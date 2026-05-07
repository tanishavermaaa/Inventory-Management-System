import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📦 Inventory Dashboard</h2>
        <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
      </div>
      <div className="alert alert-info">
        Welcome, <strong>{user?.name}</strong>! Inventory features coming next.
      </div>
    </div>
  );
}