import { useState, useEffect } from "react";
import api from "../services/api";
import socket from "../services/socket";
import ClassCard from "../components/ClassCard";
import Loading from "../components/Loading";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/classes");
      setClasses(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load classes schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();

    // Real-time Socket.IO Listeners
    function handleCapacityUpdated(data) {
      setClasses((prev) =>
        prev.map((cls) =>
          cls._id === data.classId
            ? {
                ...cls,
                bookedCount: data.bookedCount,
                availableSlots: data.availableSlots,
                isFull: data.isFull,
              }
            : cls
        )
      );
    }

    function handleClassCreated(newClass) {
      setClasses((prev) => [newClass, ...prev]);
    }

    function handleClassUpdated(updatedClass) {
      setClasses((prev) =>
        prev.map((cls) => (cls._id === updatedClass._id ? updatedClass : cls))
      );
    }

    function handleClassDeleted({ classId }) {
      setClasses((prev) => prev.filter((cls) => cls._id !== classId));
    }

    socket.on("class_capacity_updated", handleCapacityUpdated);
    socket.on("class_created", handleClassCreated);
    socket.on("class_updated", handleClassUpdated);
    socket.on("class_deleted", handleClassDeleted);

    return () => {
      socket.off("class_capacity_updated", handleCapacityUpdated);
      socket.off("class_created", handleClassCreated);
      socket.off("class_updated", handleClassUpdated);
      socket.off("class_deleted", handleClassDeleted);
    };
  }, []);

  const categories = [
    "All",
    "Yoga",
    "Cardio",
    "Strength",
    "CrossFit",
    "Zumba",
    "Pilates",
    "Boxing",
    "HIIT",
  ];

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  // Filtered classes list
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || cls.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "All" || cls.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Real-Time Schedule
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Gym Classes
          </h1>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
            Browse our schedule, check real-time available spots, and reserve your workout session.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by class title or trainer..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Difficulty Filter Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-xs font-semibold text-slate-600 shrink-0">
                Difficulty:
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff === "All" ? "All Levels" : diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <Loading message="Fetching live class schedule..." />
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-8 text-center text-rose-600 border border-rose-200 max-w-lg mx-auto">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchClasses}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm border border-slate-200 max-w-md mx-auto">
            <span className="text-5xl block mb-4">🏋️</span>
            <h3 className="text-lg font-bold text-slate-900">No classes match your filter</h3>
            <p className="mt-2 text-xs text-slate-500">
              Try adjusting your search query or selecting "All" categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedDifficulty("All");
              }}
              className="mt-5 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClasses.map((gymClass) => (
              <ClassCard
                key={gymClass._id}
                gymClass={gymClass}
                onBookingSuccess={fetchClasses}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Classes;
