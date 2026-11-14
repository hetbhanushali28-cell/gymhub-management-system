import { Link } from "react-router-dom";

function Home() {
  const membershipPlans = [
    {
      name: "The Classic",
      price: "$350",
      cadence: "/ month",
      description: "Essential access to the main training floor, standard locker rooms, and group sessions.",
      features: [
        "Full access to main training floor",
        "5 group fitness classes per month",
        "Locker room & shower access",
        "Standard mobile app scheduling",
        "Free fitness assessment",
      ],
      popular: false,
      buttonText: "Join Classic",
      badge: "Standard",
    },
    {
      name: "The Annual",
      price: "$3,500",
      cadence: "/ year",
      description: "Our signature tier for committed athletes seeking complete access and schedule flexibility.",
      features: [
        "Unlimited gym floor access 24/7",
        "Unlimited group fitness & HIIT classes",
        "Sauna, steam room & cold plunge access",
        "2 complimentary guest passes / month",
        "Priority reservation window",
      ],
      popular: true,
      buttonText: "Join Annual",
      badge: "Most Popular",
    },
    {
      name: "The VIP Elite",
      price: "$10,000",
      cadence: "/ year",
      description: "An ultra-exclusive bespoke membership offering dedicated concierges and private recovery lounges.",
      features: [
        "Private recovery lounge & cryotherapy",
        "Dedicated private locker & laundry service",
        "Personalized trainer & nutrition consultation",
        "First-priority booking on all classes",
        "24/7 Concierge and valet parking",
      ],
      popular: false,
      buttonText: "Join VIP Elite",
      badge: "Exclusive",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-24 text-center overflow-hidden border-b border-slate-800">
        {/* Glow gradients */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-indigo-600 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-500 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 mb-6 border border-amber-500/30 tracking-widest uppercase">
            ⚡ Private Members Club & Athletic Facility
          </span>
          <h1 className="text-4xl font-black md:text-6xl tracking-tight mb-6 leading-tight">
            The Pinnacle of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
              Physicality
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed mb-10">
            Welcome to GymHub — an advanced fitness and wellness sanctuary. Experience real-time schedule management, certified trainers, and premium recovery protocols.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/classes"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-base font-bold text-slate-950 transition hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 active:scale-98"
            >
              Explore Live Schedule
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-3.5 text-base font-bold text-slate-200 transition hover:bg-slate-700 hover:border-slate-600 hover:text-white"
            >
              Become a Member
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities & Unrivaled Environments */}
      <section className="bg-slate-950 px-6 py-20 border-b border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Unrivaled Environments
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              Engineered For Human Performance
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
              Every square foot is calibrated for optimal training, recovery, and wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-6 text-2xl border border-amber-500/20">
                🏋️‍♂️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Olympic Training Grounds</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Custom platforms, calibrated Eleiko plates, and specialized power cages for strength athletes.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6 text-2xl border border-indigo-500/20">
                🧘‍♀️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Private Wellness Suites</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dedicated studios for Vinyasa Flow, Pilates, and breathwork led by master practitioners.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 text-2xl border border-emerald-500/20">
                ❄️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cryo & Thermal Recovery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Whole-body cryotherapy, Finnish dry saunas, and contrast therapy plunges to accelerate healing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers (From Het's Wireframe Page 6) */}
      <section className="bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Membership Tiers
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
              Select Your Level of Commitment
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
              Transparent pricing with no hidden enrollment fees. Cancel or upgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {membershipPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-500/70 shadow-2xl shadow-amber-500/10"
                    : "bg-slate-950 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-sm text-slate-400 font-medium ml-1">
                      {plan.cadence}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80">
                  <Link
                    to={`/register?tier=${encodeURIComponent(
                      plan.name.includes("Classic")
                        ? "Classic"
                        : plan.name.includes("Annual")
                        ? "Annual"
                        : "VIP Elite"
                    )}`}
                    className={`block w-full py-3 rounded-xl text-center text-xs font-bold transition shadow-sm ${
                      plan.popular
                        ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Map & Facility Contact Section (From Het's PDF Page 2 & 3) */}
      <section className="bg-slate-950 px-6 py-16 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Club Concierge & Sanctuary Location
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Visit Our Flagship Athletic Facility
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-md">
                Located in the heart of the metropolitan district, offering 45,000 sq ft of private training floors, recovery pools, and dedicated concierge valet.
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 text-sm">
                    📍
                  </span>
                  <div>
                    <strong className="text-white">Flagship Address:</strong> 100 Premier Boulevard, Athletic Plaza, Level 4
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 text-sm">
                    ⏰
                  </span>
                  <div>
                    <strong className="text-white">Facility Hours:</strong> Monday – Sunday: 24/7 Access for VIP & Annual Members
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 text-sm">
                    📞
                  </span>
                  <div>
                    <strong className="text-white">Private Concierge:</strong> +1 (800) 555-ELITE • concierge@gymhub.com
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Interactive Location Map Mockup */}
            <div className="relative h-64 sm:h-72 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-center p-6 text-center">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30 mb-3 shadow-lg shadow-amber-500/10 animate-bounce">
                  📍
                </div>
                <h4 className="text-base font-bold text-white">Elite Athletic Club Sanctuary</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Metropolitan Athletic Plaza • 24/7 Secure Valet Parking Available
                </p>
                <span className="inline-block mt-3 rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold text-amber-300 border border-slate-700">
                  GPS: 40.7589° N, 73.9851° W (Verified Location)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-6 border-t border-slate-800 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-base font-black text-white tracking-tight">
              <span className="text-amber-400">Gym</span>Hub Private Club
            </p>
            <p className="mt-1 text-slate-400">
              MERN Stack Architecture • WebSocket Real-Time Engine • Cloud MongoDB Atlas & Render Docker
            </p>
          </div>
          <div className="flex gap-6 text-slate-400">
            <Link to="/classes" className="hover:text-white transition">Classes</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </div>
          <p>© 2026 Het Bhanushali (Roll No. 16, D15A). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
