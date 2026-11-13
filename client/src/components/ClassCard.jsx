import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

function ClassCard({ gymClass, onBookingSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const availableSlots = typeof gymClass.availableSlots === "number"
    ? gymClass.availableSlots
    : Math.max(0, gymClass.capacity - (gymClass.bookedCount || 0));

  const isFull = availableSlots <= 0;
  const bookedPercent = Math.min(
    100,
    Math.round(((gymClass.bookedCount || 0) / (gymClass.capacity || 1)) * 100)
  );

  const isNonMember =
    user &&
    (user.membershipTier === "Non-Member" ||
      user.membershipStatus === "Expired" ||
      user.daysRemaining <= 0);

  const handleBook = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/classes" } } });
      return;
    }

    if (user.role === "admin") {
      alert("Administrators cannot book member classes.");
      return;
    }

    // Intercept Non-Members & Expired members
    if (isNonMember) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/bookings", { classId: gymClass._id });
      setSuccess(true);
      if (onBookingSuccess) onBookingSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to book class.";
      setError(msg);
      if (msg.includes("already booked")) {
        setSuccess(true);
      } else if (err.response?.data?.requiresMembership) {
        setShowUpgradeModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "Beginner":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Intermediate":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Advanced":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full">
      {/* Top Accent Strip */}
      <div className={`h-2 transition-colors ${isFull ? "bg-slate-400" : "bg-gradient-to-r from-indigo-500 to-purple-600"}`} />

      <div className="p-6 flex flex-col flex-grow">
        {/* Category & Difficulty Badges */}
        <div className="flex justify-between items-center mb-4">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
            {gymClass.category}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(gymClass.difficulty)}`}>
            {gymClass.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {gymClass.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed flex-grow">
          {gymClass.description}
        </p>

        {/* Schedule Info */}
        <div className="space-y-2 text-xs text-slate-600 mt-5 border-t border-slate-100 pt-4">
          <p className="flex items-center gap-2">
            <span className="text-sm">👨‍🏫</span>
            <span><strong className="text-slate-800">Trainer:</strong> {gymClass.instructor}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span>{gymClass.date} at <strong className="text-slate-800">{gymClass.time}</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-sm">⏱️</span>
            <span>{gymClass.duration} minutes session</span>
          </p>
        </div>

        {/* Capacity Bar & Real-time Slots Indicator */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Live Availability:</span>
            {isFull ? (
              <span className="font-bold text-rose-600 uppercase text-[11px] bg-rose-50 px-2 py-0.5 rounded">
                Fully Booked
              </span>
            ) : availableSlots <= 3 ? (
              <span className="font-bold text-amber-600 animate-pulse text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                ⚡ Only {availableSlots} {availableSlots === 1 ? "spot" : "spots"} left!
              </span>
            ) : (
              <span className="font-bold text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                {availableSlots} spots available
              </span>
            )}
          </div>

          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? "bg-rose-500"
                  : bookedPercent > 75
                  ? "bg-amber-500"
                  : "bg-indigo-600"
              }`}
              style={{ width: `${bookedPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block text-right">
            {gymClass.bookedCount || 0} / {gymClass.capacity} filled
          </span>
        </div>

        {error && (
          <p className="mt-3 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
            {error}
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={handleBook}
          disabled={loading || isFull || success}
          className={`mt-4 w-full rounded-xl py-3 text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer ${
            success
              ? "bg-emerald-600 text-white cursor-default"
              : isFull
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isNonMember
              ? "bg-amber-600 hover:bg-amber-500 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-98"
          }`}
        >
          {loading
            ? "Booking Spot..."
            : success
            ? "Booked Successfully ✓"
            : isFull
            ? "Class Full"
            : isNonMember
            ? "🔒 Reserve (Membership Required)"
            : "Reserve Spot"}
        </button>
      </div>

      {/* Non-Member Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/30 p-6 shadow-2xl text-white animate-fadeIn">
            <div className="text-center mb-4">
              <span className="text-4xl block mb-2">🔒</span>
              <h3 className="text-lg font-black text-white">Membership Pass Required</h3>
              <p className="text-xs text-slate-400 mt-1">
                You are currently signed in as a <strong className="text-amber-400">Non-Member / Guest</strong>. Class spot reservations require an active membership pass.
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">The Classic</p>
                  <p className="text-[10px] text-slate-400">Gym floor & 5 classes</p>
                </div>
                <span className="font-black text-amber-400">$350 / mo</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">The Annual</p>
                  <p className="text-[10px] text-slate-400">Unlimited classes & sauna</p>
                </div>
                <span className="font-black text-amber-400">$3,500 / yr</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">The VIP Elite</p>
                  <p className="text-[10px] text-slate-400">Private recovery & valet</p>
                </div>
                <span className="font-black text-amber-400">$10,000 / yr</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => navigate("/member/dashboard")}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md"
              >
                ⚡ Activate Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassCard;
