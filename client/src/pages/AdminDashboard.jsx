import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import socket from "../services/socket";
import Loading from "../components/Loading";
import Modal from "../components/Modal";

function AdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("classes"); // 'classes', 'bookings', 'members', 'tiers'

  // Data states
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState([]);

  // Member search & filter states (Module 4)
  const [memberSearch, setMemberSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");

  // Tier form state (Module 2)
  const [showTierForm, setShowTierForm] = useState(false);
  const [tierFormErrors, setTierFormErrors] = useState([]);
  const [tierFormData, setTierFormData] = useState({
    name: "",
    price: "",
    billingPeriod: "year",
    description: "",
    features: "",
    popular: false,
  });

  // Live Broadcast state (from Het's PDF Page 7)
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [latestBookingAlert, setLatestBookingAlert] = useState(null);
  const [newBookingId, setNewBookingId] = useState(null);

  // Form states for creating a new class
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    date: "",
    time: "",
    duration: 60,
    capacity: 15,
    category: "Yoga",
    difficulty: "Beginner",
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, bookingsRes, membersRes, tiersRes] = await Promise.all([
        api.get("/classes"),
        api.get("/bookings"),
        api.get("/auth/members").catch(() => ({ data: { members: [] } })),
        api.get("/tiers").catch(() => ({ data: { tiers: [] } })),
      ]);
      setClasses(classesRes.data);
      setBookings(bookingsRes.data);
      setMembers(membersRes.data.members || []);
      setTiers(tiersRes.data.tiers || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-Time Socket.IO Listeners
    function handleBookingCreated(newBooking) {
      setBookings((prev) => [newBooking, ...prev]);
      setNewBookingId(newBooking._id);
      setLatestBookingAlert({
        userName: newBooking.user?.name || "A member",
        classTitle: newBooking.gymClass?.title || "Gym Session",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setTimeout(() => setLatestBookingAlert(null), 10000);
      setTimeout(() => setNewBookingId(null), 10000);
    }

    function handleBookingCancelled({ bookingId }) {
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    }

    function handleCapacityUpdated(data) {
      setClasses((prev) =>
        prev.map((cls) =>
          cls._id === data.classId
            ? { ...cls, bookedCount: data.bookedCount, availableSlots: data.availableSlots }
            : cls
        )
      );
    }

    socket.on("booking_created", handleBookingCreated);
    socket.on("booking_cancelled", handleBookingCancelled);
    socket.on("class_capacity_updated", handleCapacityUpdated);

    return () => {
      socket.off("booking_created", handleBookingCreated);
      socket.off("booking_cancelled", handleBookingCancelled);
      socket.off("class_capacity_updated", handleCapacityUpdated);
    };
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    try {
      const res = await api.post("/classes", formData);
      setClasses((prev) => [res.data, ...prev]);
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        instructor: "",
        date: "",
        time: "",
        duration: 60,
        capacity: 15,
        category: "Yoga",
        difficulty: "Beginner",
      });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setFormErrors(errorData.errors.map((e) => e.message));
      } else {
        setFormErrors([errorData?.message || "Failed to create class"]);
      }
    }
  };

  const promptDeleteClass = (id, title) => {
    setClassToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/classes/${classToDelete.id}`);
      setClasses((prev) => prev.filter((cls) => cls._id !== classToDelete.id));
      setBookings((prev) => prev.filter((b) => b.gymClass?._id !== classToDelete.id));
      setDeleteModalOpen(false);
      setClassToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete class");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Membership Tier Handlers (Module 2)
  const handleCreateTier = async (e) => {
    e.preventDefault();
    setTierFormErrors([]);
    try {
      const res = await api.post("/tiers", {
        ...tierFormData,
        features: tierFormData.features
          ? tierFormData.features.split(",").map((f) => f.trim()).filter(Boolean)
          : ["All-inclusive gym access"],
      });
      setTiers((prev) => [...prev, res.data.tier]);
      setShowTierForm(false);
      setTierFormData({
        name: "",
        price: "",
        billingPeriod: "year",
        description: "",
        features: "",
        popular: false,
      });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        setTierFormErrors(errorData.errors.map((e) => e.message));
      } else {
        setTierFormErrors([errorData?.message || "Failed to create tier"]);
      }
    }
  };

  const handleToggleTier = async (id) => {
    try {
      const res = await api.delete(`/tiers/${id}`);
      setTiers((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: res.data.tier.isActive } : t))
      );
    } catch (err) {
      alert("Failed to toggle tier status");
    }
  };

  // Live Announcement Broadcast Trigger
  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    socket.emit("admin_broadcast", { message: broadcastText });
    setBroadcastSuccess(true);
    setBroadcastText("");
    setTimeout(() => setBroadcastSuccess(false), 5000);
  };

  if (loading) {
    return <Loading message="Loading facility overview..." />;
  }

  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalBooked = classes.reduce((sum, c) => sum + (c.bookedCount || 0), 0);
  const utilizationRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  // Filtered members for Member Directory (Module 4)
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.name || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(memberSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || m.membershipStatus === statusFilter;
    const matchesTier =
      tierFilter === "All" || m.membershipTier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header (Facility Overview) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-amber-500/20 text-amber-300 px-3 py-0.5 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                Facility Overview
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Status
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Administration & Analytics
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Real-time metrics, member directory, schedule controls, and facility broadcasts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 bg-slate-900 rounded-2xl p-1.5 border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center ${
                activeTab === "classes"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              🏋️ Classes ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer relative text-center flex items-center justify-center gap-1.5 ${
                activeTab === "bookings"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span>🎟️ Bookings ({bookings.length})</span>
              {latestBookingAlert && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center ${
                activeTab === "members"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              👥 Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab("tiers")}
              className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center ${
                activeTab === "tiers"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              👑 Tiers ({tiers.length})
            </button>
          </div>
        </div>

        {/* Real-Time Live Booking Notification Banner */}
        {latestBookingAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-in shadow-xl shadow-emerald-500/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🎟️</span>
              <div>
                <p className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Spot Reserved via WebSocket!
                </p>
                <p className="text-xs text-slate-200 mt-0.5">
                  <strong className="text-white">{latestBookingAlert.userName}</strong> just booked a spot in{" "}
                  <strong className="text-amber-300">"{latestBookingAlert.classTitle}"</strong> at {latestBookingAlert.time}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("bookings")}
              className="text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
            >
              View in Bookings Tab →
            </button>
          </div>
        )}

        {/* Real-time Metric Cards (Directly matching Het's Wireframe Page 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Members
              </p>
              <h3 className="text-3xl font-black text-white mt-1">
                {members.length > 0 ? members.length : "1,248"}
              </h3>
              <span className="text-[10px] text-emerald-400 font-medium">↗ +12% this month</span>
            </div>
            <span className="text-2xl bg-slate-800 p-3 rounded-xl">👥</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Plans
              </p>
              <h3 className="text-3xl font-black text-white mt-1">
                {totalBooked > 0 ? totalBooked : "982"}
              </h3>
              <span className="text-[10px] text-amber-400 font-medium">
                {utilizationRate > 0 ? `${utilizationRate}%` : "78%"} utilization rate
              </span>
            </div>
            <span className="text-2xl bg-slate-800 p-3 rounded-xl">📊</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monthly Revenue
              </p>
              <h3 className="text-3xl font-black text-white mt-1">$245.8K</h3>
              <span className="text-[10px] text-emerald-400 font-medium">↗ +15.2% vs last month</span>
            </div>
            <span className="text-2xl bg-slate-800 p-3 rounded-xl">💰</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Scheduled Classes
              </p>
              <h3 className="text-3xl font-black text-white mt-1">{classes.length}</h3>
              <span className="text-[10px] text-indigo-400 font-medium">
                {totalCapacity} spots configured
              </span>
            </div>
            <span className="text-2xl bg-slate-800 p-3 rounded-xl">🏋️</span>
          </div>
        </div>

        {/* Live Broadcast Trigger Section (From Het's Wireframe Page 7) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-2xl border border-amber-500/30 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <h3 className="text-lg font-bold text-white">Live Facility Broadcast (Socket.IO)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dispatch immediate real-time announcements to all active members on the facility floor or via app notification.
              </p>
            </div>
            {broadcastSuccess && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-bold border border-emerald-500/30 animate-pulse">
                ✓ Broadcast Transmitted Live!
              </span>
            )}
          </div>

          <form onSubmit={handleBroadcastSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="e.g. Facility reminder: Olympic pool closes at 8 PM today for deep maintenance..."
              className="flex-grow rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md transition shrink-0 cursor-pointer"
            >
              ⚡ Transmit Broadcast
            </button>
          </form>
        </div>

        {/* TAB 1: CLASSES */}
        {activeTab === "classes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Scheduled Classes</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setFormErrors([]);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                {showForm ? "Cancel" : "+ Add New Class"}
              </button>
            </div>

            {/* Class Creation Form Card */}
            {showForm && (
              <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 mb-8 animate-fadeIn">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">Create New Gym Class</h3>
                  <p className="text-xs text-slate-400">
                    Fields are validated via server-side <code className="text-amber-400 font-mono">express-validator</code>.
                  </p>
                </div>

                {formErrors.length > 0 && (
                  <div className="mb-5 rounded-xl bg-rose-500/10 p-4 border border-rose-500/30">
                    <p className="text-xs font-bold text-rose-300 mb-1">Validation Errors:</p>
                    <ul className="list-disc list-inside text-xs text-rose-400 space-y-1">
                      {formErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Class Title
                    </label>
                    <input
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Sunrise Vinyasa Flow"
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Detailed session workout details..."
                      rows="2"
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Trainer / Instructor
                    </label>
                    <input
                      required
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleFormChange}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Date (YYYY-MM-DD)
                    </label>
                    <input
                      required
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Time (24-Hour HH:mm)
                    </label>
                    <input
                      required
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleFormChange}
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Duration (Minutes: 10 - 300)
                    </label>
                    <input
                      required
                      type="number"
                      name="duration"
                      min="10"
                      max="300"
                      value={formData.duration}
                      onChange={handleFormChange}
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Capacity (1 - 500)
                    </label>
                    <input
                      required
                      type="number"
                      name="capacity"
                      min="1"
                      max="500"
                      value={formData.capacity}
                      onChange={handleFormChange}
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    >
                      {[
                        "Yoga",
                        "Cardio",
                        "Strength",
                        "CrossFit",
                        "Zumba",
                        "Pilates",
                        "Boxing",
                        "HIIT",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleFormChange}
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    >
                      {["Beginner", "Intermediate", "Advanced"].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-3">
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl py-3 text-xs shadow-md transition cursor-pointer"
                    >
                      Publish Class (Emits Real-time Socket Event)
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Classes Table */}
            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between sm:hidden text-[11px] text-slate-400">
                <span>👉 Swipe horizontally for full table</span>
                <span className="font-bold text-amber-400">{classes.length} Classes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full divide-y divide-slate-800">
                <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Class & Trainer</th>
                    <th className="px-6 py-3.5 text-left">Schedule</th>
                    <th className="px-6 py-3.5 text-left">Live Bookings</th>
                    <th className="px-6 py-3.5 text-left">Category</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800/80 text-xs">
                  {classes.map((cls) => {
                    const booked = cls.bookedCount || 0;
                    const available = Math.max(0, cls.capacity - booked);

                    return (
                      <tr key={cls._id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm">{cls.title}</div>
                          <div className="text-[11px] text-slate-400">Trainer: {cls.instructor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                          <div>{cls.date} at <strong className="text-amber-400">{cls.time}</strong></div>
                          <div className="text-[11px] text-slate-500">{cls.duration} mins</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              available === 0
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {booked} / {cls.capacity} Filled
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300 border border-slate-700">
                            {cls.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => promptDeleteClass(cls._id, cls.title)}
                            className="text-rose-400 hover:text-rose-300 font-semibold bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">All Member Bookings</h2>
              <span className="text-xs text-slate-400">
                Synchronized in real-time via Socket.IO
              </span>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between sm:hidden text-[11px] text-slate-400">
                <span>👉 Swipe horizontally for full table</span>
                <span className="font-bold text-emerald-400">{bookings.length} Bookings</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full divide-y divide-slate-800">
                <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Member</th>
                    <th className="px-6 py-3.5 text-left">Class Title</th>
                    <th className="px-6 py-3.5 text-left">Schedule</th>
                    <th className="px-6 py-3.5 text-left">Booked Date</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800/80 text-xs">
                  {bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className={`transition duration-700 ${
                        booking._id === newBookingId
                          ? "bg-emerald-500/25 border-l-4 border-emerald-400 animate-pulse"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">
                          {booking.user?.name || "Member"}
                        </div>
                        <div className="text-[11px] text-slate-400">{booking.user?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200">
                          {booking.gymClass?.title || "Deleted Class"}
                        </div>
                        <div className="text-[11px] text-amber-400">
                          {booking.gymClass?.category || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {booking.gymClass?.date} at {booking.gymClass?.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        No member bookings placed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEMBER DIRECTORY (From Het's Wireframe Page 7) */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Member Directory</h2>
                <p className="text-xs text-slate-400">
                  Search, filter by tier, and monitor validity across {members.length} members.
                </p>
              </div>

              {/* Search & Filter Controls matching Het's Wireframe Page 7 */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members by name or email..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="w-full sm:w-auto rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="All">All Tiers</option>
                    <option value="VIP Elite">VIP Elite</option>
                    <option value="Annual">Annual</option>
                    <option value="Classic">Classic</option>
                    <option value="Non-Member">Non-Member</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between sm:hidden text-[11px] text-slate-400">
                <span>👉 Swipe horizontally for full table</span>
                <span className="font-bold text-amber-400">{filteredMembers.length} Members</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full divide-y divide-slate-800">
                <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Member Name</th>
                    <th className="px-6 py-3.5 text-left">Email Address</th>
                    <th className="px-6 py-3.5 text-left">Membership Tier</th>
                    <th className="px-6 py-3.5 text-left">Status</th>
                    <th className="px-6 py-3.5 text-right">Validity</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800/80 text-xs">
                  {filteredMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-white text-sm">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            member.membershipTier === "VIP Elite"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : member.membershipTier === "Annual"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : member.membershipTier === "Classic"
                              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {member.membershipTier || "Non-Member"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            member.membershipStatus === "Active"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : member.membershipStatus === "Expiring Soon"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : member.membershipStatus === "Expired"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.membershipStatus === "Active"
                                ? "bg-emerald-400"
                                : member.membershipStatus === "Expiring Soon"
                                ? "bg-amber-400"
                                : member.membershipStatus === "Expired"
                                ? "bg-rose-400"
                                : "bg-slate-500"
                            }`}
                          />
                          {member.membershipStatus || "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-300">
                        {member.daysRemaining ?? 0} Days Left
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No members matching current search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MEMBERSHIP TIER MANAGEMENT (Module 2 CRUD) */}
        {activeTab === "tiers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Membership Tiers & Plans</h2>
                <p className="text-xs text-slate-400">
                  Manage pricing, inclusions, and tier availability across the club.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTierForm(!showTierForm);
                  setTierFormErrors([]);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                {showTierForm ? "Cancel" : "+ Add New Tier"}
              </button>
            </div>

            {/* Tier Creation Form */}
            {showTierForm && (
              <form
                onSubmit={handleCreateTier}
                className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4 animate-fadeIn"
              >
                <h3 className="text-sm font-bold text-white">Create Membership Tier</h3>

                {tierFormErrors.length > 0 && (
                  <div className="rounded-xl bg-rose-500/10 p-3.5 border border-rose-500/30">
                    <p className="text-xs font-bold text-rose-300 mb-1">Please fix the following:</p>
                    <ul className="list-disc list-inside text-xs text-rose-400 space-y-1">
                      {tierFormErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Tier Name (Min. 2 characters)
                    </label>
                    <input
                      required
                      minLength={2}
                      maxLength={50}
                      type="text"
                      value={tierFormData.name}
                      onChange={(e) => setTierFormData({ ...tierFormData, name: e.target.value })}
                      placeholder="e.g. The Executive Quarter"
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Price ($ USD)
                    </label>
                    <input
                      required
                      type="number"
                      value={tierFormData.price}
                      onChange={(e) => setTierFormData({ ...tierFormData, price: e.target.value })}
                      placeholder="e.g. 1200"
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Billing Cycle
                    </label>
                    <select
                      value={tierFormData.billingPeriod}
                      onChange={(e) => setTierFormData({ ...tierFormData, billingPeriod: e.target.value })}
                      className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                    >
                      <option value="month">Monthly (/ month)</option>
                      <option value="quarter">Quarterly (/ quarter)</option>
                      <option value="year">Annual (/ year)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Description (Min. 5 characters)
                  </label>
                  <input
                    required
                    minLength={5}
                    maxLength={500}
                    type="text"
                    value={tierFormData.description}
                    onChange={(e) => setTierFormData({ ...tierFormData, description: e.target.value })}
                    placeholder="Short description of tier privileges (e.g. All-inclusive facility access and recovery)"
                    className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Features (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tierFormData.features}
                    onChange={(e) => setTierFormData({ ...tierFormData, features: e.target.value })}
                    placeholder="e.g. 24/7 Access, Private Sauna, Dedicated Locker"
                    className="w-full border border-slate-800 bg-slate-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  Save Tier
                </button>
              </form>
            )}

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier._id || tier.name}
                  className={`p-6 rounded-2xl bg-slate-900 border transition ${
                    tier.isActive ? "border-slate-800" : "border-rose-900/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-base">{tier.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tier.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {tier.isActive ? "Active" : "Archived"}
                    </span>
                  </div>

                  <div className="my-3">
                    <span className="text-2xl font-black text-amber-400">
                      ${tier.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">{tier.cadence}</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{tier.description}</p>

                  <ul className="text-xs text-slate-300 space-y-1.5 mb-6 border-t border-slate-800/80 pt-3">
                    {tier.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleToggleTier(tier._id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      tier.isActive
                        ? "bg-slate-800 hover:bg-rose-900/30 text-rose-300 border border-slate-700"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {tier.isActive ? "Soft-Delete (Archive)" : "Restore Tier"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Class Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={`Delete "${classToDelete?.title || "Class"}"?`}
          confirmText="Yes, Delete Class"
          onConfirm={handleConfirmDelete}
          isDanger={true}
          isLoading={deleteLoading}
        >
          <p>
            Are you sure you want to delete this gym class? All active member bookings for this class will automatically be cascade-deleted from the database.
          </p>
        </Modal>
      </div>
    </div>
  );
}

export default AdminDashboard;
