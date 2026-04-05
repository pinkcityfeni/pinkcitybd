// This file is no longer used - routing goes through App.tsx directly
import { Navigate } from 'react-router-dom';
export default function Index() {
  return <Navigate to="/" replace />;
}
