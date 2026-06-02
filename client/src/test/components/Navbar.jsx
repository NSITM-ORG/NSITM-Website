import { Link } from 'react-router';
import ThemeToggle from '../../theme'; // Kept from previous step

export default function Navbar() {
    
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', gap: '20px', fontFamily: 'var(--sans)' }}>
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}>🏠 Home</Link>
        <Link to="/seo-demo" style={{ color: 'var(--text)', textDecoration: 'none' }}>SEO Hook</Link>
        <Link to="/routing-demo" style={{ color: 'var(--text)', textDecoration: 'none' }}>Routing Guide</Link>
      </div>
      <ThemeToggle />
    </nav>
  );
}
