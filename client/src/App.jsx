import { Routes, Route } from "react-router";
import Navbar from "./test/components/Navbar";
import SeoDemo from "./test/pages/SeoDemo";
import RouterDemo from "./test/pages/RouterDemo";
// import { useHeadSEO, SEO_CONFIG } from "./hooks/main-seo";

/**
 * App — Root Application Component
 *
 * BrowserRouter now lives in main.jsx, so useHeadSEO (which calls useLocation
 * internally) has router context available when it runs here.
 *
 * useHeadSEO(SEO_CONFIG.home) sets the default metadata for the "/" route.
 * Every child page calls its own useHeadSEO to override for its specific route.
 */
function App() {
  // useHeadSEO(SEO_CONFIG.home);

  return (
    <>
      {/* Global navigation — rendered on every route */}
      <Navbar />

      <main style={{ flex: 1, padding: "40px 20px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1>NextServe Systems Template</h1>
                <p>
                  Select a route from the top navbar to review the individual
                  implementations.
                </p>
              </div>
            }
          />
          <Route path="/seo-demo" element={<SeoDemo />} />
          <Route path="/routing-demo" element={<RouterDemo />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
