
export default function RouterDemo() {
    return (
      <div style={{ padding: '24px', textAlign: 'left' }}>
        <h2>2. React Router v7 & Vite Configuration</h2>
        <p>This layout is powered by React Router v7 linked up with Vite.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Key Setup Requirements:</h3>
          <ul style={{ lineHeight: '2' }}>
            <li>Installed via <code>npm install react-router</code>.</li>
            <li>Uses <code>&lt;BrowserRouter&gt;</code> inside the app layout entry point.</li>
            <li>Uses <code>&lt;Routes&gt;</code> and <code>&lt;Route&gt;</code> to manage path states.</li>
            <li>Uses <code>&lt;Link&gt;</code> components for instant client-side transitions.</li>
          </ul>
        </div>
      </div>
    );
  }
  