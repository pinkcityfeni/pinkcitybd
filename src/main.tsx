import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAuth } from "./data/auth";

// Initialize auth listener before rendering
initAuth();

// Register service worker for push notifications (production only, not in iframe/preview)
if ('serviceWorker' in navigator) {
  const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
  const isPreviewHost = window.location.hostname.includes('id-preview--') || window.location.hostname.includes('lovableproject.com');
  if (isPreviewHost || isInIframe) {
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW register failed', err));
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
