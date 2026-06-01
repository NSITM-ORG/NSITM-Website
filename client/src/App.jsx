import { Helmet } from "react-helmet-async";
import logo from "./logo.svg";
import "./App.css";
import SEOTemplate from "./components/SEOTemplate";

function App() {
  return (
    <>
      {/* SEO Configuration - Customize per page or use default */}
      <SEOTemplate
        title="My App - Welcome"
        description="A modern React 19 app built with Vite and Helmet for SEO"
        keywords="react, vite, seo, helmet"
        ogTitle="My App"
        ogDescription="A modern React 19 app built with Vite"
        ogImage="/logo512.png"
        ogUrl="https://myapp.com"
        twitterCard="summary_large_image"
        canonical="https://myapp.com"
      />

      {/* Additional Helmet tags specific to this page */}
      <Helmet>
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="App">
        <header className="App-header">
          <h1 className="text-4xl font-bold text-red-600">
            Hello Tailwind + React 19!
          </h1>
          <img src={logo} className="App-logo" alt="React logo" />
          <p>
            Edit <code>src/App.jsx</code> and save to reload.
          </p>
          <p className="text-lg text-gray-700 mt-4">
            🚀 Powered by Vite with React 19 and Helmet for SEO
          </p>
          <a
            className="App-link"
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <a
            className="App-link mt-2"
            href="https://vitejs.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Vite
          </a>
        </header>
      </div>
    </>
  );
}

export default App;
