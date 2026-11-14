import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import socket from "../services/socket";
import Loading from "../components/Loading";
import Modal from "../components/Modal";

function MyBookings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'calendar', 'analytics', 'profile'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics filter state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("30 Days");

  // Profile Form state (Module 2)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "+1 (555) 234-8901",
    emergencyName: user?.emergencyContact?.name || "Sarah Connor",
    emergencyPhone: user?.emergencyContact?.phone || "+1 (555) 987-6543",
    emergencyRelation: user?.emergencyContact?.relation || "Spouse",
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Membership Renewal State (from Het's PDF Page 8)
  const [membershipTier, setMembershipTier] = useState(user?.membershipTier || "VIP Elite");
  const [daysRemaining, setDaysRemaining] = useState(user?.daysRemaining || 245);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("VIP Elite");
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(false);

  // Booking Cancellation Modal State
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Calendar State (Page 9 Wireframe)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().getDate());

  // Live Announcements List (Page 8 Wireframe)
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Recovery Lounge Access",
      message: "The new cryotherapy chamber is now available for booking in the recovery lounge.",
      time: "Just now",
    },
    {
      id: 2,
      title: "Pool Maintenance",
      message: "The Olympic lap pool will undergo scheduled maintenance tomorrow between 2 PM - 4 PM.",
      time: "2 hours ago",
    },
    {
      id: 3,
      title: "Exclusive VIP Event",
      message: "Exclusive VIP masterclass registration opens next week. Check your email for details.",
      time: "Yesterday",
    },
  ]);

  useEffect(() => {
    fetchBookings();

    // Listen for socket events
    function handleClassDeleted({ classId }) {
      setBookings((prev) => prev.filter((b) => b.gymClass?._id !== classId));
    }

    function handleAnnouncement(notif) {
      if (notif.type === "announcement" || notif.type === "membership_renewed") {
        setAnnouncements((prev) => [
          {
            id: notif.id || Date.now(),
            title: notif.title || "Facility Announcement",
            message: notif.message,
            time: notif.timestamp || "Just now",
          },
          ...prev,
        ]);
      }
    }

    socket.on("class_deleted", handleClassDeleted);
    socket.on("notification", handleAnnouncement);

    return () => {
      socket.off("class_deleted", handleClassDeleted);
      socket.off("notification", handleAnnouncement);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/my");
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (bookingId) => {
    setCancellingId(bookingId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingId) return;

    try {
      setCancelLoading(true);
      await api.delete(`/bookings/${cancellingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== cancellingId));
      setCancelModalOpen(false);
      setCancellingId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      setRenewLoading(true);
      const res = await api.put("/auth/renew", {
        tier: selectedPlan,
        additionalDays: 365,
      });

      setMembershipTier(res.data.user.membershipTier);
      setDaysRemaining(res.data.user.daysRemaining);
      setRenewSuccess(true);
      setTimeout(() => {
        setRenewSuccess(false);
        setRenewModalOpen(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Renewal failed");
    } finally {
      setRenewLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await api.put("/auth/profile", {
        name: profileForm.name,
        phone: profileForm.phone,
        emergencyContact: {
          name: profileForm.emergencyName,
          phone: profileForm.emergencyPhone,
          relation: profileForm.emergencyRelation,
        },
      });
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading member portal..." />;
  }

  // Days in current month for Calendar Widget (Page 9 Wireframe)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Top Header & Sub-Nav Menu */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Elite Athletic Member Portal
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {membershipTier}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Good Morning, {user?.name || "Member"}.
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Personalized schedules, performance analytics, membership validity, and recovery protocols.
            </p>
          </div>

          {/* Sub Navigation matching Het's Wireframes (Page 7, 8, 9) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 bg-slate-900 rounded-2xl p-1.5 border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center ${
                activeTab === "dashboard"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center ${
                activeTab === "calendar"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              📅 Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center ${
                activeTab === "analytics"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center ${
                activeTab === "profile"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              👤 Profile
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & DASHBOARD (Het's Wireframe Page 8 Top)        */}
        {/* ============================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Member Status & Announcements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Membership Status Card */}
              <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 border border-amber-500/30 shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl select-none">
                  ⚡
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider border ${
                          membershipTier === "Non-Member"
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : daysRemaining === 0
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        STATUS: {membershipTier} {daysRemaining === 0 && "(Expired)"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          daysRemaining > 0 && membershipTier !== "Non-Member"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            daysRemaining > 0 && membershipTier !== "Non-Member"
                              ? "bg-emerald-400 animate-pulse"
                              : "bg-amber-400"
                          }`}
                        />
                        {daysRemaining > 0 && membershipTier !== "Non-Member"
                          ? "Active Subscription"
                          : "No Active Pass"}
                      </span>
                    </div>

                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                      Membership Validity
                    </p>
                    <h2 className="text-4xl font-black text-white mt-1 tracking-tight">
                      {daysRemaining} <span className="text-lg font-medium text-slate-400">Days Remaining</span>
                    </h2>

                    {membershipTier === "Non-Member" || daysRemaining === 0 ? (
                      <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">
                        ⚡ <strong>Guest Notice:</strong> You currently do not have an active membership pass. Activate or renew a pass to book gym floor sessions and group fitness classes.
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2 max-w-lg">
                        All-inclusive facility access, private wellness suites, biometric tracking, and priority class reservation privileges.
                      </p>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400">
                      Member ID: <span className="text-white font-mono font-semibold">ELITE-{(user?._id || "108").slice(-6).toUpperCase()}</span> • Email: <span className="text-white">{user?.email}</span>
                    </div>
                    <button
                      onClick={() => setRenewModalOpen(true)}
                      className="w-full sm:w-auto rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      {membershipTier === "Non-Member" || daysRemaining === 0 ? "⚡ Activate Membership Pass" : "⚡ Renew Subscription"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Announcements Feed (Page 8 Wireframe) */}
              <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-md flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">📢</span>
                    <h3 className="font-bold text-sm text-white">Live Announcements</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                    Socket.IO
                  </span>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-56 pr-1 divide-y divide-slate-800/60">
                  {announcements.map((a) => (
                    <div key={a.id} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-amber-300">{a.title}</span>
                        <span className="text-slate-500 text-[10px]">{a.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Class Schedule & Bookings Snapshot */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Upcoming Reserved Sessions</h3>
                  <p className="text-xs text-slate-400">Your registered workout sessions</p>
                </div>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  View Full Calendar →
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p className="text-2xl mb-2">📅</p>
                  <p>You have no scheduled bookings today.</p>
                  <Link
                    to="/classes"
                    className="inline-block mt-3 text-amber-400 font-bold hover:underline"
                  >
                    Browse Live Classes & Reserve a Slot →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.slice(0, 4).map((b) => (
                    <div
                      key={b._id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          {b.gymClass?.category || "Workout"}
                        </span>
                        <h4 className="font-bold text-sm text-white">{b.gymClass?.title}</h4>
                        <p className="text-xs text-slate-400">
                          {b.gymClass?.date} at {b.gymClass?.time} • Trainer: {b.gymClass?.instructor}
                        </p>
                      </div>
                      <button
                        onClick={() => openCancelModal(b._id)}
                        className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BOOKINGS & CALENDAR (Het's Wireframe Page 9)             */}
        {/* ============================================================== */}
        {activeTab === "calendar" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Member Bookings</h2>
                <p className="text-xs text-slate-400">
                  Manage your elite training schedule and upcoming appointments.
                </p>
              </div>
              <Link
                to="/classes"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition"
              >
                + Book New Session
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Calendar Widget (Directly matching Page 9 Wireframe) */}
              <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-base text-white">October 2026</h3>
                  <div className="flex gap-1">
                    <button className="h-7 w-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs">
                      ‹
                    </button>
                    <button className="h-7 w-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs">
                      ›
                    </button>
                  </div>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                  {/* Empty offset days */}
                  <span className="p-2 text-slate-700">28</span>
                  <span className="p-2 text-slate-700">29</span>
                  <span className="p-2 text-slate-700">30</span>

                  {daysInMonth.map((day) => {
                    const isSelected = day === selectedCalendarDate;
                    const hasSession = [5, 12, 15, 22, 28].includes(day);

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedCalendarDate(day)}
                        className={`relative p-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-black shadow-md"
                            : hasSession
                            ? "bg-slate-800/80 text-white border border-amber-500/30"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {day}
                        {hasSession && (
                          <span
                            className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                              isSelected ? "bg-slate-950" : "bg-amber-400"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Reserved Session
                  </span>
                  <span>Selected: Oct {selectedCalendarDate}, 2026</span>
                </div>
              </div>

              {/* Upcoming Sessions List (Directly matching Page 9 Wireframe) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Upcoming Reserved Sessions</h3>
                  <span className="text-xs text-slate-400">{bookings.length} Registered</span>
                </div>

                {/* Pre-configured wireframe sessions matching Page 9 */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/20">
                        🏋️
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Personal Training with Marcus T.</h4>
                        <p className="text-xs text-slate-400">Strength & Conditioning • Floor 2</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <span>🕒 Today, 10:00 AM - 11:00 AM</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition">
                        Reschedule
                      </button>
                      <button className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/20 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
                        ❄️
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Recovery Protocol (Cryotherapy & Sauna)</h4>
                        <p className="text-xs text-slate-400">Wellness Center, Level 2 • Suite A</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <span>🕒 Oct 15, 2:00 PM - 3:00 PM</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition">
                        Reschedule
                      </button>
                      <button className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/20 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dynamically booked classes */}
                {bookings.map((booking) => {
                  const c = booking.gymClass;
                  if (!c) return null;
                  return (
                    <div
                      key={booking._id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            {c.category}
                          </span>
                          <h4 className="font-bold text-white text-sm">{c.title}</h4>
                          <p className="text-xs text-slate-400">Instructor: {c.instructor}</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                          Live Reserved
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                        <span>🕒 {c.date} at {c.time} ({c.duration} mins)</span>
                        <button
                          onClick={() => openCancelModal(booking._id)}
                          className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/20 transition"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PERFORMANCE ANALYTICS (Het's Wireframe Page 8 Bottom)   */}
        {/* ============================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white">Performance Analytics</h2>
                <p className="text-xs text-slate-400">
                  Precision tracking for continuous athletic excellence. Your data, refined.
                </p>
              </div>

              {/* Timeframe Filters matching Wireframe */}
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                {["This Week", "30 Days", "YTD"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setAnalyticsTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      analyticsTimeframe === tf
                        ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Cards matching Het's Wireframe Page 8 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Weekly Volume
                </p>
                <h3 className="text-3xl font-black text-white mt-1">24.5k</h3>
                <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">
                  ↗ +8.2% vs last week
                </span>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  HR Recovery
                </p>
                <h3 className="text-3xl font-black text-white mt-1">42 <span className="text-base font-normal text-slate-400">bpm/min</span></h3>
                <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">
                  ✓ Optimal Range
                </span>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Strength Index
                </p>
                <h3 className="text-3xl font-black text-amber-400 mt-1">94.2</h3>
                <span className="text-xs text-amber-300 font-semibold mt-1 inline-block">
                  ★ Top 5% of Members
                </span>
              </div>
            </div>

            {/* Strength Progression 6-Month Chart (Page 8 Wireframe) */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Strength Progression</h3>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                    Composite Score • 6 Months
                  </p>
                </div>
                <span className="text-xs text-slate-500">Jan - Jun 2026</span>
              </div>

              {/* Chart SVG Visualization */}
              <div className="relative h-48 w-full pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 150">
                  <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />

                  {/* Filled Area */}
                  <path
                    d="M 50 110 Q 150 95, 250 70 T 450 45 T 550 25 L 550 140 L 50 140 Z"
                    fill="url(#curveGradient)"
                  />

                  {/* Line Stroke */}
                  <path
                    d="M 50 110 Q 150 95, 250 70 T 450 45 T 550 25"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />

                  {/* Data Points */}
                  <circle cx="50" cy="110" r="5" fill="#f59e0b" />
                  <circle cx="150" cy="95" r="5" fill="#f59e0b" />
                  <circle cx="250" cy="70" r="5" fill="#f59e0b" />
                  <circle cx="350" cy="55" r="5" fill="#f59e0b" />
                  <circle cx="450" cy="45" r="5" fill="#f59e0b" />
                  <circle cx="550" cy="25" r="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* X-Axis Month Labels */}
                <div className="flex justify-between text-xs text-slate-400 mt-2 px-6">
                  <span>Jan (72)</span>
                  <span>Feb (78)</span>
                  <span>Mar (84)</span>
                  <span>Apr (88)</span>
                  <span>May (91)</span>
                  <span className="font-bold text-amber-400">Jun (94.2)</span>
                </div>
              </div>
            </div>

            {/* Personal Records & Consistency (Page 8 Wireframe) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Personal Records (PRs)</h3>
                  <span className="text-xs text-amber-400 font-semibold">Verified</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300">Conventional Deadlift</span>
                    <strong className="text-amber-400 font-mono text-sm">495 lbs</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300">Olympic Back Squat</span>
                    <strong className="text-amber-400 font-mono text-sm">405 lbs</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300">Barbell Bench Press</span>
                    <strong className="text-amber-400 font-mono text-sm">315 lbs</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white">Training Consistency</h3>
                    <span className="rounded-full bg-amber-500/20 text-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                      Elite Tier
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    You have maintained a 96% session attendance across 24 scheduled workout blocks this quarter.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full w-[96%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 text-right">
                    96% Consistency Score
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MEMBER PROFILE & SECURITY (Module 2 CRUD)                */}
        {/* ============================================================== */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-white">Member Profile & Contacts</h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage personal information, emergency contacts, and active subscription details.
              </p>
            </div>

            {profileSaveSuccess && (
              <div className="rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-300 border border-emerald-500/20">
                ✓ Member profile updated successfully in MongoDB!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Registered Email (Read-Only)
                </label>
                <input
                  disabled
                  type="email"
                  value={user?.email || ""}
                  className="w-full rounded-xl bg-slate-950/50 border border-slate-800/50 px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                  Emergency Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={profileForm.emergencyName}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyName: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={profileForm.emergencyPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={profileForm.emergencyRelation}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyRelation: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  {profileSaving ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Gym Booking?"
          confirmText="Yes, Cancel Booking"
          onConfirm={handleConfirmCancel}
          isDanger={true}
          isLoading={cancelLoading}
        >
          <p>
            Are you sure you want to cancel this booking? Your reserved slot will immediately be returned to available capacity in real time.
          </p>
        </Modal>

        {/* Renew Subscription Modal (From Het's Wireframe Page 8) */}
        <Modal
          isOpen={renewModalOpen}
          onClose={() => setRenewModalOpen(false)}
          title="Renew Gym Membership"
          confirmText="Confirm & Extend 365 Days"
          onConfirm={handleRenewSubscription}
          isDanger={false}
          isLoading={renewLoading}
        >
          {renewSuccess ? (
            <div className="py-4 text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="font-bold text-emerald-600">Membership Successfully Extended!</p>
              <p className="text-xs text-slate-500 mt-1">Your new balance is {daysRemaining} days remaining.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Choose your preferred tier renewal. This updates your validity immediately in MongoDB and broadcasts a real-time event.
              </p>

              <div className="space-y-2">
                {[
                  { name: "VIP Elite", price: "$10,000 / yr", desc: "Private recovery lounge & cryotherapy" },
                  { name: "Annual", price: "$3,500 / yr", desc: "Unlimited class schedule & sauna" },
                  { name: "Classic", price: "$350 / mo", desc: "Standard gym floor & 5 classes" },
                ].map((tier) => (
                  <label
                    key={tier.name}
                    onClick={() => setSelectedPlan(tier.name)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedPlan === tier.name
                        ? "border-amber-500 bg-amber-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{tier.name}</p>
                      <p className="text-[11px] text-slate-500">{tier.desc}</p>
                    </div>
                    <span className="text-xs font-black text-slate-800">{tier.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default MyBookings;
