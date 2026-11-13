import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Login() {
  const { login, user, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (from && from !== "/login" && from !== "/register") {
        navigate(from, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/classes", { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden">
      {/* Background glow & subtle gym ambiance */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-amber-500 blur-[130px]" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-indigo-600 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl border border-slate-800">
        {/* Brand Header matching Het's PDF Page 7 */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-500/20 mb-3">
            Private Members Club
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-serif">
            Elite Athletic
          </h1>
          <p className="mt-1 text-xs text-slate-400 tracking-wider">
            Sign in to access your membership portal
          </p>
        </div>

        {/* Tabbed Toggle: Member Login vs Request Access */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
          <button
            type="button"
            className="flex-1 py-2 text-xs font-bold text-amber-400 bg-slate-900 rounded-lg shadow-sm border border-slate-800"
          >
            Member Login
          </button>
          <Link
            to="/register"
            className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white text-center transition"
          >
            Request Access
          </Link>
        </div>

        {/* Quick Demo Pre-fill Buttons for All Tiers & Non-Member */}
        <div className="mb-6 rounded-2xl bg-slate-950/80 p-3 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-bold text-slate-300">⚡ 1-Click Fast Fill for Demo:</span>
            <span className="text-[10px] text-amber-400/80">Select Account</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@gymhub.com", "password123")}
              className="rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 py-1 px-2 text-[10px] font-bold text-amber-300 transition text-left cursor-pointer"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("vip@gymhub.com", "password123")}
              className="rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 py-1 px-2 text-[10px] font-bold text-amber-200 transition text-left cursor-pointer"
            >
              👑 VIP Elite
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("annual@gymhub.com", "password123")}
              className="rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 py-1 px-2 text-[10px] font-bold text-indigo-300 transition text-left cursor-pointer"
            >
              🏅 Annual Pass
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("classic@gymhub.com", "password123")}
              className="rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 py-1 px-2 text-[10px] font-bold text-sky-300 transition text-left cursor-pointer"
            >
              🥉 Classic Pass
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("guest@gymhub.com", "password123")}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1 px-2 text-[10px] font-bold text-slate-300 transition text-left cursor-pointer"
            >
              👤 Non-Member
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("expired@gymhub.com", "password123")}
              className="rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 py-1 px-2 text-[10px] font-bold text-rose-300 transition text-left cursor-pointer"
            >
              ⚠️ Expired Pass
            </button>
          </div>
        </div>

        {from && !error && !authError && (
          <div className="mb-6 rounded-xl bg-amber-500/10 p-3.5 text-xs text-amber-300 border border-amber-500/20">
            Authentication required to view <span className="font-bold">{from}</span>.
          </div>
        )}

        {(error || authError) && (
          <div className="mb-6 rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-300 border border-rose-500/20">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email (e.g. john@example.com)"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <span className="text-[10px] text-amber-400/80 hover:text-amber-400 cursor-pointer">
                Forgot Password?
              </span>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? "Verifying Credentials..." : "Access Portal"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <span className="relative bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500">
            Or
          </span>
        </div>

        {/* Mock Social Sign In from Wireframe */}
        <button
          type="button"
          onClick={() => handleQuickFill("alexander@elite.com", "password123")}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-300 transition cursor-pointer"
        >
          <span className="text-sm">G</span>
          <span>Sign in with Google</span>
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          Not yet a member?{" "}
          <Link to="/register" className="font-bold text-amber-400 hover:text-amber-300">
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
