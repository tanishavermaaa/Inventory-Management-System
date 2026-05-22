import { useNavigate } from 'react-router-dom';
import {
  FaBoxOpen, FaChartLine, FaUserShield, FaBolt,
  FaCubes, FaBell, FaFileInvoice, FaUsers,
  FaCheckCircle, FaLock, FaServer
} from 'react-icons/fa';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: <FaBoxOpen />, title: 'Inventory Management', desc: 'Track and manage your stock in real-time across multiple locations with detailed item categorization.' },
    { icon: <FaChartLine />, title: 'Analytics & Reports', desc: 'Get powerful insights and generate reports to make better decisions and forecast demand effectively.' },
    { icon: <FaUserShield />, title: 'Role-Based Access', desc: 'Secure your data with role-based permissions for your team, separating admins from regular employees.' },
    { icon: <FaBolt />, title: 'Fast & Scalable', desc: 'Built with a modern MERN stack for high performance, seamless scalability, and future business growth.' },
    { icon: <FaFileInvoice />, title: 'Live Order Tracking', desc: 'Process and fulfill orders instantly with real-time status updates synced across all connected devices.' },
    { icon: <FaBell />, title: 'Smart Stock Alerts', desc: 'Never run out of inventory. Get notified immediately when stock levels drop below custom thresholds.' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#ffffff', color: '#1f2937', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <nav style={{
        background: '#1a202c',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#cca876', borderRadius: '4px', padding: '6px' }}>
            <FaBoxOpen color="#fff" size={20} />
          </div>
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>Inventory MS</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s'
          }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background='transparent'}>
            Login
          </button>
          <button onClick={() => navigate('/register')} style={{
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background 0.2s'
          }} onMouseOver={e => e.target.style.background='#16a34a'} onMouseOut={e => e.target.style.background='#22c55e'}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '80px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1400px',
        margin: '0 auto',
        gap: '60px',
        flexWrap: 'wrap'
      }}>
        {/* Left Content */}
        <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
          {/* <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#dcfce7',
            color: '#16a34a',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '24px',
            letterSpacing: '0.5px'
          }}>
            <FaBolt /> PRODUCTION-READY MERN STACK
          </div> */}
          
          <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', color: '#111827' }}>
            Manage Your Inventory<br/>
            <span style={{ color: '#22c55e' }}>Smarter & Faster</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '40px', lineHeight: 1.6 }}>
            A complete inventory management system with real-time updates, role-based access, and powerful analytics for your business.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            <button onClick={() => navigate('/register')} style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 14px rgba(34,197,94,0.4)'
            }} onMouseOver={e => e.target.style.transform='translateY(-2px)'} onMouseOut={e => e.target.style.transform='translateY(0)'}>
              Start Free →
            </button>
            {/* <button onClick={() => navigate('/login')} style={{
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }} onMouseOver={e => e.target.style.borderColor='#9ca3af'} onMouseOut={e => e.target.style.borderColor='#d1d5db'}>
              Learn More
            </button> */}
          </div>
          
          {/* <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { label: 'Real-time', sub: 'Live Updates', icon: <FaBolt /> },
              { label: 'Secure', sub: 'JWT Auth', icon: <FaLock /> },
              { label: 'Scalable', sub: 'MERN Stack', icon: <FaServer /> }
            ].map(feat => (
              <div key={feat.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#22c55e', fontSize: '24px' }}>
                  <FaCheckCircle />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{feat.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{feat.sub}</div>
                </div>
              </div>
            ))}
          </div> */}
        </div>
        
        {/* Right Images (Laptop & Warehouse) */}
        <div style={{ flex: '1 1 600px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          {/* Warehouse Background */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '85%',
            height: '95%',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 1
          }}>
            {/* <img src="/warehouse.png" alt="Warehouse logistics" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.2))' }}></div>
          </div>
          
          {/* Laptop Mockup */}
          <img src="/laptop.png" alt="Dashboard Mockup" style={{
            width: '100%',
            maxWidth: '750px',
            position: 'relative',
            zIndex: 2,
            filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.25))'
          }} />
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 40px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#dcfce7',
            color: '#16a34a',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 700,
            marginBottom: '16px',
            letterSpacing: '1px'
          }}>
            <FaBolt /> FEATURES
          </div> */}
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '64px' }}>
            Everything You Need to<br/>Manage Inventory Efficiently
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: '#fff',
                padding: '40px 32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'default',
                border: '1px solid #f3f4f6'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#f0fdf4',
                  color: '#22c55e',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  margin: '0 auto 24px'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: '#f0fdf4',
          borderRadius: '24px',
          padding: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '64px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 300px', maxWidth: '350px', display: 'flex', justifyContent: 'center' }}>
            <img src="/cta_illustration.png" alt="Inventory Ready" style={{ width: '100%', maxWidth: '300px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} />
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
              Ready to Take Control of Your Inventory?
            </h2>
            <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '32px' }}>
              Join thousands of businesses already using Inventory MS to simplify their inventory management, streamline operations, and boost efficiency.
            </p>
            <button onClick={() => navigate('/register')} style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              padding: '16px 36px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
              transition: 'transform 0.2s'
            }} onMouseOver={e => e.target.style.transform='translateY(-2px)'} onMouseOut={e => e.target.style.transform='translateY(0)'}>
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a202c', color: '#e5e7eb', marginTop: 'auto', padding: '64px 40px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', paddingBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#cca876', borderRadius: '4px', padding: '4px' }}>
                <FaBoxOpen color="#fff" size={16} />
              </div>
              <span style={{ color: '#22c55e', fontSize: '18px', fontWeight: 700 }}>Inventory MS</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, maxWidth: '300px' }}>
              A modern inventory management system to help businesses manage smarter and faster.
            </p>
          </div>
          
          {/* Links columns */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '20px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#9ca3af' }}>
              <span style={{ cursor: 'pointer' }}>Features</span>
              <span style={{ cursor: 'pointer' }}>Pricing</span>
              <span style={{ cursor: 'pointer' }}>How It Works</span>
              <span style={{ cursor: 'pointer' }}>Updates</span>
            </div>
          </div>
          
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '20px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#9ca3af' }}>
              <span style={{ cursor: 'pointer' }}>About Us</span>
              <span style={{ cursor: 'pointer' }}>Contact Us</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms & Conditions</span>
            </div>
          </div>
          
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '20px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#9ca3af' }}>
              <span style={{ cursor: 'pointer' }}>Documentation</span>
              <span style={{ cursor: 'pointer' }}>Blog</span>
              <span style={{ cursor: 'pointer' }}>Support</span>
              <span style={{ cursor: 'pointer' }}>FAQs</span>
            </div>
          </div>
          
          {/* Newsletter */}
          <div style={{ gridColumn: 'span 2' }}>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '20px' }}>Newsletter</h4>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>Subscribe to get updates and latest news.</p>
            <div style={{ display: 'flex', background: '#2d3748', borderRadius: '6px', overflow: 'hidden' }}>
              <input type="text" placeholder="Enter your email" style={{ background: 'transparent', border: 'none', padding: '12px 16px', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }} />
              <button style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0 20px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background='#16a34a'} onMouseOut={e => e.target.style.background='#22c55e'}>Subscribe</button>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', paddingTop: '32px', color: '#9ca3af', fontSize: '14px' }}>
          © 2026 Inventory MS. All rights reserved.
        </div>
      </footer>

    </div>
  );
}