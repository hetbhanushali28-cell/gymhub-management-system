import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LiveToast from "./components/LiveToast";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Classes from "./pages/Classes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <LiveToast />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute requiredRole="user">
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member"
              element={
                <ProtectedRoute requiredRole="user">
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 py-8 text-center text-slate-400">
          <p>© 2026 GymHub. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
