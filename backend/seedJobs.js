// seedJobs.js
require("dotenv").config();  
const mongoose = require("mongoose");
const Job = require("./models/job"); // adjust the path if models folder is elsewhere

// TODO: replace with your actual MongoDB URI
const MONGODB_URI = process.env.MONGO_URI;

const jobs = [
  // 1
  {
    jobName: "Local Delivery Driver",
    category: "driver",
    company: "Fast Deliveries Pvt Ltd",
    location: "Nagpur, Maharashtra",
    salary: "₹15,000 - ₹20,000",
    minAge: 21,
    availability: "full-time",
    skillsRequired: ["Valid LMV License", "City Route Knowledge"],
    experience: "1+ years",
    jobDescription:
      "Looking for a reliable local delivery driver for e-commerce parcel deliveries within Nagpur city.",
  },
  // 2
  {
    jobName: "Personal Driver",
    category: "driver",
    company: "Private Household",
    location: "Pune, Maharashtra",
    salary: "₹20,000 - ₹25,000",
    minAge: 25,
    availability: "full-time",
    skillsRequired: [
      "LMV License",
      "Clean Driving Record",
      "Basic Hindi/Marathi",
    ],
    experience: "3+ years",
    jobDescription:
      "Personal driver required for a family, responsible for school drops, office commute and weekend travel.",
  },
  // 3
  {
    jobName: "Night Shift Truck Driver",
    category: "driver",
    company: "Highway Logistics",
    location: "Nagpur, Maharashtra",
    salary: "₹25,000 - ₹35,000",
    minAge: 23,
    availability: "night",
    skillsRequired: [
      "Heavy Vehicle License",
      "Highway Driving",
      "Basic Vehicle Maintenance",
    ],
    experience: "2+ years",
    jobDescription:
      "Experienced truck driver needed for night shift interstate transport. Food and stay provided on long trips.",
  },
  // 4
  {
    jobName: "Restaurant Cook (Indian Cuisine)",
    category: "cook",
    company: "Spice Garden Restaurant",
    location: "Nagpur, Maharashtra",
    salary: "₹18,000 - ₹25,000",
    minAge: 22,
    availability: "full-time",
    skillsRequired: ["North Indian Dishes", "Tandoor", "Kitchen Hygiene"],
    experience: "2+ years",
    jobDescription:
      "Restaurant seeking experienced cook for North Indian cuisine. Accommodation can be provided if required.",
  },
  // 5
  {
    jobName: "Tiffin Center Cook",
    category: "cook",
    company: "HomeStyle Tiffins",
    location: "Nagpur, Maharashtra",
    salary: "₹12,000 - ₹18,000",
    minAge: 20,
    availability: "full-time",
    skillsRequired: ["Home-style Cooking", "Veg Meals Preparation"],
    experience: "1+ years",
    jobDescription:
      "Cook required for tiffin service, preparing homely veg meals twice a day for office goers.",
  },
  // 6
  {
    jobName: "House Cleaner",
    category: "cleaner",
    company: "Urban Homes",
    location: "Nagpur, Maharashtra",
    salary: "₹8,000 - ₹12,000",
    minAge: 18,
    availability: "part-time",
    skillsRequired: ["House Cleaning", "Mopping", "Dusting"],
    experience: "6+ months",
    jobDescription:
      "Part-time cleaner required for daily household cleaning work in residential apartments.",
  },
  // 7
  {
    jobName: "Office Cleaner",
    category: "cleaner",
    company: "CleanCorp Services",
    location: "Pune, Maharashtra",
    salary: "₹10,000 - ₹14,000",
    minAge: 20,
    availability: "full-time",
    skillsRequired: ["Office Cleaning", "Washroom Maintenance"],
    experience: "1+ years",
    jobDescription:
      "Office cleaner needed for corporate office cleaning, pantry cleaning and dusting.",
  },
  // 8
  {
    jobName: "Gardener for Housing Society",
    category: "gardener",
    company: "GreenSpace Society",
    location: "Nagpur, Maharashtra",
    salary: "₹12,000 - ₹16,000",
    minAge: 20,
    availability: "full-time",
    skillsRequired: ["Plant Care", "Lawn Maintenance", "Pruning"],
    experience: "1+ years",
    jobDescription:
      "Gardener required to maintain garden area, plants and lawn in a large housing society.",
  },
  // 9
  {
    jobName: "Home Gardener (Part-time)",
    category: "gardener",
    company: "Private Bungalow",
    location: "Nagpur, Maharashtra",
    salary: "₹5,000 - ₹8,000",
    minAge: 18,
    availability: "part-time",
    skillsRequired: ["Basic Gardening", "Watering Plants"],
    experience: "0-1 years",
    jobDescription:
      "Part-time gardener needed for 3–4 hours daily to maintain home garden and potted plants.",
  },
  // 10
  {
    jobName: "Residential Plumber",
    category: "plumber",
    company: "FixIt Plumbing",
    location: "Nagpur, Maharashtra",
    salary: "₹18,000 - ₹25,000",
    minAge: 22,
    availability: "flexible",
    skillsRequired: ["Pipe Fitting", "Leak Repair", "Water Tank Installation"],
    experience: "2+ years",
    jobDescription:
      "Experienced plumber required for residential plumbing jobs. Travel allowance provided.",
  },
  // 11
  {
    jobName: "Electrician for Commercial Projects",
    category: "electrician",
    company: "PowerTech Solutions",
    location: "Nagpur, Maharashtra",
    salary: "₹22,000 - ₹30,000",
    minAge: 22,
    availability: "full-time",
    skillsRequired: [
      "Electrical Wiring",
      "Panel Board Installation",
      "Safety Standards",
    ],
    experience: "3+ years",
    jobDescription:
      "Electrician needed for commercial wiring projects and shop/office electrical work.",
  },
  // 12
  {
    jobName: "Home Electrician",
    category: "electrician",
    company: "LocalOnCall Services",
    location: "Nagpur, Maharashtra",
    salary: "₹15,000 - ₹22,000",
    minAge: 21,
    availability: "flexible",
    skillsRequired: ["Fan/Light Installation", "Fault Finding"],
    experience: "1+ years",
    jobDescription:
      "Electrician required for on-call home service visits for basic electrical repairs.",
  },
  // 13
  {
    jobName: "Security Guard (Day Shift)",
    category: "security",
    company: "SafeWatch Security",
    location: "Nagpur, Maharashtra",
    salary: "₹13,000 - ₹16,000",
    minAge: 21,
    availability: "day",
    skillsRequired: ["Gate Management", "Visitor Entry Register"],
    experience: "1+ years",
    jobDescription:
      "Security guard required for residential building day shift, 12 hours duty.",
  },
  // 14
  {
    jobName: "Security Guard (Night Shift)",
    category: "security",
    company: "SafeWatch Security",
    location: "Nagpur, Maharashtra",
    salary: "₹14,000 - ₹17,000",
    minAge: 21,
    availability: "night",
    skillsRequired: ["Night Patrolling", "CCTV Monitoring"],
    experience: "1+ years",
    jobDescription:
      "Night shift security guard required for warehouse security and patrolling.",
  },
  // 15
  {
    jobName: "Factory Helper",
    category: "factory",
    company: "MegaFactory Industries",
    location: "Nagpur, Maharashtra",
    salary: "₹12,000 - ₹16,000",
    minAge: 18,
    availability: "full-time",
    skillsRequired: ["Basic Machine Handling", "Loading/Unloading"],
    experience: "0-1 years",
    jobDescription:
      "Factory helper needed for packaging, loading and basic machine support work.",
  },
  // 16
  {
    jobName: "Construction Labour",
    category: "construction",
    company: "BuildIt Infra",
    location: "Nagpur, Maharashtra",
    salary: "₹500 - ₹700 per day",
    minAge: 18,
    availability: "full-time",
    skillsRequired: ["Construction Site Work", "Material Handling"],
    experience: "0-2 years",
    jobDescription:
      "Construction labour required for building construction work. Daily wages with weekly payment.",
  },
  // 17
  {
    jobName: "Mason (Rajmistri)",
    category: "construction",
    company: "BuildIt Infra",
    location: "Nagpur, Maharashtra",
    salary: "₹20,000 - ₹30,000",
    minAge: 22,
    availability: "full-time",
    skillsRequired: ["Brick Laying", "Plastering", "Tile Work"],
    experience: "3+ years",
    jobDescription:
      "Experienced mason required for residential and commercial projects, per-square-foot payment options available.",
  },
  // 18
  {
    jobName: "House Maid (Full-time)",
    category: "house-help",
    company: "Private Residence",
    location: "Nagpur, Maharashtra",
    salary: "₹10,000 - ₹14,000",
    minAge: 20,
    availability: "full-time",
    skillsRequired: ["Cooking Basic Food", "Cleaning", "Utensil Washing"],
    experience: "1+ years",
    jobDescription:
      "Full-time house maid required for cooking, cleaning and basic household work.",
  },
  // 19
  {
    jobName: "Babysitter / Nanny",
    category: "house-help",
    company: "Private Residence",
    location: "Nagpur, Maharashtra",
    salary: "₹12,000 - ₹18,000",
    minAge: 22,
    availability: "full-time",
    skillsRequired: ["Child Care", "Basic Cooking", "Patience"],
    experience: "1+ years",
    jobDescription:
      "Nanny required for 2-year-old child, responsible for feeding, playing and basic child care.",
  },
  // 20
  {
    jobName: "Office Boy",
    category: "office-helper",
    company: "TechServe Solutions",
    location: "Nagpur, Maharashtra",
    salary: "₹10,000 - ₹13,000",
    minAge: 18,
    availability: "full-time",
    skillsRequired: ["Tea/Coffee Service", "Document Handling"],
    experience: "0-1 years",
    jobDescription:
      "Office boy required for tea/coffee service, basic cleaning and document delivery between departments.",
  },
  // 21
  {
    jobName: "Part-time Delivery Partner (Bike)",
    category: "driver",
    company: "QuickFood Delivery",
    location: "Nagpur, Maharashtra",
    salary: "₹12,000 - ₹18,000",
    minAge: 18,
    availability: "flexible",
    skillsRequired: ["Two Wheeler License", "Smartphone Usage"],
    experience: "0-1 years",
    jobDescription:
      "Part-time food delivery partner required, flexible timings with per-delivery incentives.",
  },
  // 22
  {
    jobName: "Car Wash Attendant",
    category: "cleaner",
    company: "Shine & Drive",
    location: "Nagpur, Maharashtra",
    salary: "₹9,000 - ₹12,000",
    minAge: 18,
    availability: "full-time",
    skillsRequired: ["Car Washing", "Polishing"],
    experience: "0-1 years",
    jobDescription:
      "Car wash worker required for washing and basic vacuum cleaning of cars.",
  },
  // 23
  {
    jobName: "Watchman for Small Shop",
    category: "security",
    company: "Local Kirana Store",
    location: "Nagpur, Maharashtra",
    salary: "₹8,000 - ₹10,000",
    minAge: 21,
    availability: "night",
    skillsRequired: ["Basic Security", "Night Duty"],
    experience: "0-1 years",
    jobDescription:
      "Night watchman required to look after small kirana shop during night hours.",
  },
  // 24
  {
    jobName: "Cook for PG (Boys Hostel)",
    category: "cook",
    company: "Student PG",
    location: "Nagpur, Maharashtra",
    salary: "₹16,000 - ₹22,000",
    minAge: 22,
    availability: "full-time",
    skillsRequired: ["Veg/Non-veg Cooking", "Bulk Cooking"],
    experience: "2+ years",
    jobDescription:
      "Cook required for boys hostel PG, responsible for breakfast, lunch and dinner for 25–30 students.",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    // Optional: clear existing jobs
    // await Job.deleteMany({});
    // console.log("Old jobs cleared");

    const result = await Job.insertMany(jobs);
    console.log(`Inserted ${result.length} jobs`);
  } catch (err) {
    console.error("Error seeding jobs:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seed();
