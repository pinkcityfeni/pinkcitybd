import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAuth } from "./data/auth";

// Initialize auth listener before rendering
initAuth();

createRoot(document.getElementById("root")!).render(<App />);
