import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Register() {
  const { register, user, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTier = searchParams.get("tier") || "VIP Elite";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    membershipTier: initialTier,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  // If query param changes, update tier
  useEffect(() => {
    const tierParam = searchParams.get("tier");
    if (tierParam) {
      setFormData((prev) => ({ ...prev, membershipTier: tierParam }));
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/member/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.membershipTier
      );
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 right-1/3 w-96 h-96 rounded-full bg-amber-500 blur-[130px]" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-indigo-600 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl border border-slate-800">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-500/20 mb-3">
            Private Members Club
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-serif">
            Elite Athletic
          </h1>
          <p className="mt-1 text-xs text-slate-400 tracking-wider">
            Choose your membership tier pass or sign up as a guest
          </p>
        </div>

        {/* Tabbed Toggle: Member Login vs Request Access */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
          <Link
            to="/login"
            className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white text-center transition"
          >
            Member Login
          </Link>
          <button
            type="button"
            className="flex-1 py-2 text-xs font-bold text-amber-400 bg-slate-900 rounded-lg shadow-sm border border-slate-800"
          >
            Request Access
          </button>
        </div>

        {(error || authError) && (
          <div className="mb-6 rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-300 border border-rose-500/20">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Membership Tier Pass Selector */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Select Membership Tier Pass
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "VIP Elite", name: "The VIP Elite", price: "$10,000 / yr", badge: "Exclusive" },
                { id: "Annual", name: "The Annual", price: "$3,500 / yr", badge: "Popular" },
                { id: "Classic", name: "The Classic", price: "$350 / mo", badge: "Standard" },
                { id: "Non-Member", name: "Non-Member", price: "Free Guest", badge: "No Pass" },
              ].map((tier) => (
                <label
                  key={tier.id}
                  onClick={() => setFormData({ ...formData, membershipTier: tier.id })}
                  className={`flex flex-col justify-between p-3 rounded-xl border cursor-pointer transition ${
                    formData.membershipTier === tier.id
                      ? "border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/10"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{tier.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        formData.membershipTier === tier.id
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-300">{tier.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. David Guest or Alexander Sterling"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. user@elite.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? "Registering Account..." : `Join as ${formData.membershipTier}`}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
