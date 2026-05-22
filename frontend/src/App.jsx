
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login             from './pages/Login';
// import Register          from './pages/Register';
// import AdminDashboard    from './pages/AdminDashboard';
// import Categories        from './pages/Categories';
// import Products          from './pages/Products';
// import EmployeeDashboard from './pages/EmployeeDashboard';
// import EmployeeOrders    from './pages/EmployeeOrders';
// import 'bootstrap/dist/css/bootstrap.min.css';
// function App() {
//   const token   = localStorage.getItem('token');
//   const user    = JSON.parse(localStorage.getItem('user') || '{}');
//   const isAdmin = token && user.role === 'admin';
//   const isUser  = token && user.role === 'user';

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/"        element={<Navigate to="/login" />} />
//         <Route path="/login"   element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* ── Admin ── */}
//         <Route path="/admin-dashboard"            element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
//         <Route path="/admin-dashboard/categories" element={isAdmin ? <Categories />     : <Navigate to="/login" />} />
//         <Route path="/admin-dashboard/products"   element={isAdmin ? <Products />       : <Navigate to="/login" />} />

//         {/* ── Employee ── */}
//         <Route path="/employee-dashboard"         element={isUser ? <EmployeeDashboard /> : <Navigate to="/login" />} />
//         <Route path="/employee-dashboard/orders"  element={isUser ? <EmployeeOrders />    : <Navigate to="/login" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
// export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage       from './pages/LandingPage';
import Login             from './pages/Login';
import Register          from './pages/Register';
import AdminDashboard    from './pages/AdminDashboard';
import Categories        from './pages/Categories';
import Products          from './pages/Products';
import Users             from './pages/Users';
import AdminOrders       from './pages/AdminOrders';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeOrders    from './pages/EmployeeOrders';
import Profile           from './pages/Profile';
import Suppliers         from './pages/Suppliers';

const AdminRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  return token && user.role === 'admin' ? children : <Navigate to="/login" replace />;
};

const EmployeeRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  return token && user.role === 'user' ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin-dashboard"            element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin-dashboard/categories" element={<AdminRoute><Categories /></AdminRoute>} />
        <Route path="/admin-dashboard/products"   element={<AdminRoute><Products /></AdminRoute>} />
        <Route path="/admin-dashboard/suppliers"  element={<AdminRoute><Suppliers /></AdminRoute>} />
        <Route path="/admin-dashboard/users"      element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin-dashboard/orders"     element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin-dashboard/profile"    element={<AdminRoute><Profile /></AdminRoute>} />

        <Route path="/employee-dashboard"         element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
        <Route path="/employee-dashboard/orders"  element={<EmployeeRoute><EmployeeOrders /></EmployeeRoute>} />
        <Route path="/employee-dashboard/profile" element={<EmployeeRoute><Profile /></EmployeeRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;