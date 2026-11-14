import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="text-2xl font-black flex items-center gap-2 tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 text-lg">
            ⚡
          </span>
          <span>
            <span className="text-indigo-400">Gym</span>Hub
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium hover:text-indigo-400 transition">
            Home
          </Link>
          <Link to="/classes" className="text-sm font-medium hover:text-indigo-400 transition">
            Classes
          </Link>

          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5"
                >
                  <span>🛡️</span> Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/member/dashboard"
                  className="text-sm font-medium hover:text-amber-400 transition"
                >
                  Member Portal
                </Link>
              )}

              {/* Real-time Socket.IO Notification Bell */}
              <NotificationBell />

              <div className="flex items-center gap-3 border-l border-slate-800 pl-5">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-200 leading-tight">{user.name}</p>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === "admin"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-rose-600 hover:border-rose-500 hover:text-white transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-1.5"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-white"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-900 px-5 py-4 md:hidden animate-slide-in">
          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition"
            >
              🏠 Home
            </Link>
            <Link
              to="/classes"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition"
            >
              🏋️ Live Classes
            </Link>

            {user ? (
              <>
                {user.role === "admin" ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMenu}
                    className="px-3 py-2.5 rounded-xl text-sm font-bold text-amber-400 hover:bg-slate-800/80 transition flex items-center gap-2"
                  >
                    <span>🛡️</span> Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/member/dashboard"
                    onClick={closeMenu}
                    className="px-3 py-2.5 rounded-xl text-sm font-bold text-amber-400 hover:bg-slate-800/80 transition flex items-center gap-2"
                  >
                    <span>⚡</span> Member Portal
                  </Link>
                )}
                <div className="mt-2 border-t border-slate-800/80 pt-3 flex items-center justify-between px-2">
                  <div>
                    <p className="text-xs font-bold text-slate-100">{user.name}</p>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        user.role === "admin"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {user.role === "admin" ? "ADMIN" : user.membershipTier || "MEMBER"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-rose-600/90 hover:bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2 border-t border-slate-800/80 pt-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-slate-700 py-2.5 text-center text-sm font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
