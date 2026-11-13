const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const GymClass = require("./models/GymClass");
const Booking = require("./models/Booking");
const MembershipTier = require("./models/MembershipTier");

const seedDatabase = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gym-management";
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB:", mongoUri);
    }

    // Clear existing data
    await Booking.deleteMany();
    await GymClass.deleteMany();
    await User.deleteMany();
    console.log("Cleared existing data");

    // Create Admin User
    const adminUser = new User({
      name: "Admin User",
      email: "admin@gymhub.com",
      password: "password123",
      role: "admin",
      membershipTier: "VIP Elite",
      membershipStatus: "Active",
      daysRemaining: 365,
      phone: "+1 (800) 555-0199",
      emergencyContact: {
        name: "Security Desk",
        phone: "+1 (800) 555-0190",
        relation: "Administration",
      },
    });
    await adminUser.save();

    // Create Sample Members (matching Het's project report wireframes)
    const member1 = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "user",
      membershipTier: "VIP Elite",
      membershipStatus: "Active",
      daysRemaining: 245,
      phone: "+1 (555) 234-8901",
      emergencyContact: {
        name: "Sarah Connor",
        phone: "+1 (555) 987-6543",
        relation: "Spouse",
      },
    });
    await member1.save();

    const member2 = new User({
      name: "Alexander Sterling",
      email: "alexander@elite.com",
      password: "password123",
      role: "user",
      membershipTier: "Annual",
      membershipStatus: "Active",
      daysRemaining: 180,
      phone: "+1 (555) 345-6789",
      emergencyContact: {
        name: "Eleanor Sterling",
        phone: "+1 (555) 876-5432",
        relation: "Sister",
      },
    });
    await member2.save();

    const member3 = new User({
      name: "Victoria Chen",
      email: "victoria@elite.com",
      password: "password123",
      role: "user",
      membershipTier: "Classic",
      membershipStatus: "Expiring Soon",
      daysRemaining: 5,
      phone: "+1 (555) 456-7890",
      emergencyContact: {
        name: "David Chen",
        phone: "+1 (555) 765-4321",
        relation: "Father",
      },
    });
    await member3.save();

    const member4 = new User({
      name: "Marcus Webb",
      email: "marcus@elite.com",
      password: "password123",
      role: "user",
      membershipTier: "VIP Elite",
      membershipStatus: "Active",
      daysRemaining: 310,
      phone: "+1 (555) 567-8901",
      emergencyContact: {
        name: "Laura Webb",
        phone: "+1 (555) 654-3210",
        relation: "Spouse",
      },
    });
    await member4.save();

    // 5. Explicit VIP Elite demo user
    const memberVip = new User({
      name: "Maximilian Vance (VIP)",
      email: "vip@gymhub.com",
      password: "password123",
      role: "user",
      membershipTier: "VIP Elite",
      membershipStatus: "Active",
      daysRemaining: 365,
      phone: "+1 (555) 777-8888",
      emergencyContact: {
        name: "Olivia Vance",
        phone: "+1 (555) 888-9999",
        relation: "Spouse",
      },
    });
    await memberVip.save();

    // 6. Explicit Annual demo user
    const memberAnnual = new User({
      name: "Julian Cross (Annual)",
      email: "annual@gymhub.com",
      password: "password123",
      role: "user",
      membershipTier: "Annual",
      membershipStatus: "Active",
      daysRemaining: 365,
      phone: "+1 (555) 444-5555",
      emergencyContact: {
        name: "Claire Cross",
        phone: "+1 (555) 555-6666",
        relation: "Partner",
      },
    });
    await memberAnnual.save();

    // 7. Explicit Classic demo user
    const memberClassic = new User({
      name: "Lucas Miller (Classic)",
      email: "classic@gymhub.com",
      password: "password123",
      role: "user",
      membershipTier: "Classic",
      membershipStatus: "Active",
      daysRemaining: 30,
      phone: "+1 (555) 333-2222",
      emergencyContact: {
        name: "Hannah Miller",
        phone: "+1 (555) 222-1111",
        relation: "Sister",
      },
    });
    await memberClassic.save();

    // 8. Non-Member / Free Guest (No Active Pass, 0 Days)
    const nonMember = new User({
      name: "David Guest (Non-Member)",
      email: "guest@gymhub.com",
      password: "password123",
      role: "user",
      membershipTier: "Non-Member",
      membershipStatus: "Inactive",
      daysRemaining: 0,
      phone: "+1 (555) 123-9999",
      emergencyContact: {
        name: "Robert Guest",
        phone: "+1 (555) 123-8888",
        relation: "Brother",
      },
    });
    await nonMember.save();

    // 9. Expired Member
    const memberExpired = new User({
      name: "Elena Brooks (Expired)",
      email: "expired@gymhub.com",
      password: "password123",
      role: "user",
      membershipTier: "Classic",
      membershipStatus: "Expired",
      daysRemaining: 0,
      phone: "+1 (555) 999-0000",
      emergencyContact: {
        name: "Samuel Brooks",
        phone: "+1 (555) 999-1111",
        relation: "Parent",
      },
    });
    await memberExpired.save();

    console.log("All tier and non-member users created successfully!");

    // Create 21 comprehensive gym classes across ALL 8 categories & 3 difficulty levels
    const classes = await GymClass.insertMany([
      // 1. HIIT (Advanced, Intermediate, Beginner)
      {
        title: "Extreme Tabata & Plyometric HIIT",
        description: "Max-intensity 20-10 intervals designed to push anaerobic thresholds and elevate EPOC metabolic burn.",
        instructor: "Marcus Vance",
        date: "2026-11-24",
        time: "07:30",
        duration: 45,
        capacity: 15,
        category: "HIIT",
        difficulty: "Advanced",
        createdBy: adminUser._id,
      },
      {
        title: "Redline Athletic Conditioning",
        description: "High-cadence cardiovascular intervals combining skiergs, rowers, and air bikes for advanced stamina.",
        instructor: "Alex Rivera",
        date: "2026-11-25",
        time: "18:00",
        duration: 50,
        capacity: 12,
        category: "HIIT",
        difficulty: "Advanced",
        createdBy: adminUser._id,
      },
      {
        title: "Power HIIT & Functional Training",
        description: "Fast-paced intervals designed to build stamina, tone muscles, and burn fat with kettlebells and battle ropes.",
        instructor: "Alex Rivera",
        date: "2026-11-23",
        time: "08:30",
        duration: 45,
        capacity: 14,
        category: "HIIT",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },
      {
        title: "Intro to Metabolic Conditioning",
        description: "A gentle introduction to interval-based conditioning with low-impact bodyweight patterns.",
        instructor: "Chloe Bennett",
        date: "2026-11-26",
        time: "10:00",
        duration: 40,
        capacity: 18,
        category: "HIIT",
        difficulty: "Beginner",
        createdBy: adminUser._id,
      },

      // 2. Strength
      {
        title: "Olympic Weightlifting & Power Cages",
        description: "Clean & jerk, snatch technique, and calibrated heavy squat mechanics on Eleiko platforms.",
        instructor: "Dmitri Volkov",
        date: "2026-11-21",
        time: "19:00",
        duration: 75,
        capacity: 10,
        category: "Strength",
        difficulty: "Advanced",
        createdBy: adminUser._id,
      },
      {
        title: "Hypertrophy Upper Body Protocol",
        description: "Targeted push-pull volume work focusing on mechanical tension, mind-muscle connection, and pump.",
        instructor: "Marcus Vance",
        date: "2026-11-22",
        time: "17:30",
        duration: 60,
        capacity: 12,
        category: "Strength",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },
      {
        title: "Foundational Barbell Mechanics",
        description: "Learn proper bracing, spinal alignment, and form for deadlifts, squats, and bench pressing safely.",
        instructor: "Sarah Jenkins",
        date: "2026-11-20",
        time: "09:00",
        duration: 50,
        capacity: 15,
        category: "Strength",
        difficulty: "Beginner",
        createdBy: adminUser._id,
      },

      // 3. Boxing
      {
        title: "Championship Heavy Bag & Sparring",
        description: "High-octane boxing combinations, slip drills, counter-striking, and heavy bag conditioning.",
        instructor: "Mike Tyson",
        date: "2026-11-21",
        time: "18:00",
        duration: 60,
        capacity: 10,
        category: "Boxing",
        difficulty: "Advanced",
        createdBy: adminUser._id,
      },
      {
        title: "Fighter Conditioning & Mitt Work",
        description: "Rhythm mitt work, speed bag timing, and body-shot conditioning with professional trainers.",
        instructor: "Tyson Fury",
        date: "2026-11-23",
        time: "19:30",
        duration: 45,
        capacity: 14,
        category: "Boxing",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },
      {
        title: "Boxing Footwork & Jab Fundamentals",
        description: "Master the jab, cross, pivot, and guard defense in an encouraging, non-contact atmosphere.",
        instructor: "Liam Walker",
        date: "2026-11-25",
        time: "11:00",
        duration: 45,
        capacity: 16,
        category: "Boxing",
        difficulty: "Beginner",
        createdBy: adminUser._id,
      },

      // 4. Yoga
      {
        title: "Morning Vinyasa Flow",
        description: "Start your day right with a relaxing yet energizing yoga session suitable for all levels.",
        instructor: "Sarah Jenkins",
        date: "2026-11-20",
        time: "07:00",
        duration: 60,
        capacity: 15,
        category: "Yoga",
        difficulty: "Beginner",
        createdBy: adminUser._id,
      },
      {
        title: "Ashtanga Core & Balance Flow",
        description: "Dynamic postures linking breath to synchronized movement, building core stability and hip mobility.",
        instructor: "Sarah Jenkins",
        date: "2026-11-22",
        time: "08:00",
        duration: 60,
        capacity: 16,
        category: "Yoga",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },
      {
        title: "Inversion Mastery & Advanced Asanas",
        description: "Pincha mayurasana, handstand balance, and deep backbend sequencing for experienced yogis.",
        instructor: "Elena Rostova",
        date: "2026-11-24",
        time: "06:30",
        duration: 75,
        capacity: 12,
        category: "Yoga",
        difficulty: "Advanced",
        createdBy: adminUser._id,
      },

      // 5. CrossFit
      {
        title: "High Intensity CrossFit WOD",
        description: "Push your physical limits with this advanced CrossFit strength and conditioning benchmark circuit.",
        instructor: "Mike Tyson",
        date: "2026-11-21",
        time: "18:30",
        duration: 45,
        capacity: 10,
        category: "CrossFit",
        difficulty: "Advanced",
        createdBy: adminUser._id,
      },
      {
        title: "MetCon & Kettlebell Circuit",
        description: "Timed rounds of wall-balls, box jumps, kettlebell swings, and synchronized burpees.",
        instructor: "Jason Hunter",
        date: "2026-11-23",
        time: "17:00",
        duration: 50,
        capacity: 12,
        category: "CrossFit",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },
      {
        title: "CrossFit Foundations & Pacing",
        description: "Learn functional movement standards, scaling options, and aerobic pacing strategies.",
        instructor: "Jason Hunter",
        date: "2026-11-25",
        time: "09:30",
        duration: 45,
        capacity: 15,
        category: "CrossFit",
        difficulty: "Beginner",
        createdBy: adminUser._id,
      },

      // 6. Pilates
      {
        title: "Classical Reformer & Core Alignment",
        description: "Spring-resistance reformer session focusing on pelvic stability, spinal articulation, and posture.",
        instructor: "Victoria Brooks",
        date: "2026-11-22",
        time: "10:30",
        duration: 50,
        capacity: 8,
        category: "Pilates",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },
      {
        title: "Mat Pilates & Postural Restoration",
        description: "Deep core activation, glute medius strength, and lower-back decompression on memory foam mats.",
        instructor: "Victoria Brooks",
        date: "2026-11-25",
        time: "16:00",
        duration: 45,
        capacity: 14,
        category: "Pilates",
        difficulty: "Beginner",
        createdBy: adminUser._id,
      },

      // 7. Zumba
      {
        title: "Latin Rhythm Cardio Dance Party",
        description: "Calorie-torching Salsa, Merengue, and Cumbia dance cardio that feels like a weekend celebration.",
        instructor: "Sofia Ramirez",
        date: "2026-11-21",
        time: "16:00",
        duration: 45,
        capacity: 25,
        category: "Zumba",
        difficulty: "Beginner",
        createdBy: adminUser._id,
      },
      {
        title: "High-Energy Reggaeton Zumba Fusion",
        description: "Fast-paced choreography set to urban Latin and Afrobeat club hits with high cardio intervals.",
        instructor: "Sofia Ramirez",
        date: "2026-11-24",
        time: "18:30",
        duration: 50,
        capacity: 20,
        category: "Zumba",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },

      // 8. Cardio
      {
        title: "Cardio Blast & Core Endurance",
        description: "Get your heart rate pumping and torch calories in this high-energy athletic cardio session.",
        instructor: "Emma Watson",
        date: "2026-11-22",
        time: "17:00",
        duration: 30,
        capacity: 20,
        category: "Cardio",
        difficulty: "Intermediate",
        createdBy: adminUser._id,
      },
      {
        title: "VO2 Max Hill Sprints & Assault Bike",
        description: "Elite anaerobic threshold protocol utilizing curved treadmills and air resistance assault bikes.",
        instructor: "Jason Hunter",
        date: "2026-11-26",
        time: "07:00",
        duration: 45,
        capacity: 10,
        category: "Cardio",
        difficulty: "Advanced",
        createdBy: adminUser._id,
      },
    ]);

    console.log(`Successfully created ${classes.length} diverse gym classes!`);

    // Create a sample booking for John Doe
    await Booking.create({
      user: member1._id,
      gymClass: classes[0]._id,
      status: "confirmed",
    });
    console.log(`Created sample booking for ${member1.name} on '${classes[0].title}'`);

    console.log("Database seeded successfully!");
    if (shouldExit) {
      process.exit(0);
    }
    return { success: true, classesCount: classes.length };
  } catch (error) {
    console.error("Error seeding database:", error);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
