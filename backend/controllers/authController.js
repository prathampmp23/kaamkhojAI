const AuthUser = require("../models/authUser");
const User = require("../models/user");
const Job = require("../models/job");
const { generateToken } = require("../utils/jwt");

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email and password",
      });
    }

    // Check if username already exists
    const existingUsername = await AuthUser.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    // Check if email already exists
    const existingEmail = await AuthUser.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Create new user
    const user = new AuthUser({
      username,
      email,
      password,
    });

    // Save user to database
    await user.save();

    // Success response - don't send back the password
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password",
      });
    }

    // Find user by username
    const user = await AuthUser.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileCompleted: user.profileCompleted,
        profileId: user.profileId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by the auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileCompleted: user.profileCompleted,
        profileId: user.profileId,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
      error: error.message,
    });
  }
};

// Link user profile
const linkUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required",
      });
    }

    // Update user
    const updatedUser = await AuthUser.findByIdAndUpdate(
      userId,
      {
        profileId,
        profileCompleted: true,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile linked successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profileCompleted: updatedUser.profileCompleted,
        profileId: updatedUser.profileId,
      },
    });
  } catch (error) {
    console.error("Link profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while linking profile",
      error: error.message,
    });
  }
};

// Create a user profile from voice assistant
// const createProfile = async (req, res) => {
//   try {
//     console.log("createProfile req.body:", req.body);

//     let {
//       name,
//       age,
//       address,
//       phone,
//       shift_time,
//       experience,
//       job_title,
//       salary_expectation,
//     } = req.body;

//     // Convert numeric fields
//     const numericAge = Number(age);
//     const numericExp = Number(experience);
//     const numericSalary = Number(salary_expectation);

//     // Required text fields (shift_time NOT required now)
//     if (!name || !job_title) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required text fields (name, job_title).",
//       });
//     }

//     // Validate numbers
//     if (
//       Number.isNaN(numericAge) ||
//       Number.isNaN(numericExp) ||
//       Number.isNaN(numericSalary)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Age, experience, and salary must be valid numbers.",
//       });
//     }

//     if (numericAge <= 0 || numericExp < 0 || numericSalary <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Age, experience, and salary must be positive values.",
//       });
//     }

//     const newUser = new User({
//       name,
//       age: numericAge,
//       address,
//       phone,
//       shift_time,
//       experience: numericExp,
//       job_title,
//       salary_expectation: numericSalary,
//     });

//     await newUser.save();

//     // Build job query based on profile
//     const jobQuery = {
//       jobName: { $regex: new RegExp(job_title, "i") },
//       minAge: { $lte: numericAge },
//     };

//     if (shift_time) {
//       jobQuery.availability = { $regex: new RegExp(shift_time, "i") };
//     }

//     const recommendedJobs = await Job.find(jobQuery).limit(5);

//     return res.status(201).json({
//       success: true,
//       message: "Profile created successfully!",
//       profileId: newUser._id,
//       user: newUser,
//       recommendedJobs,
//     });
//   } catch (error) {
//     console.error("Error creating profile:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while creating profile.",
//       error: error.message,
//     });
//   }
// };

const createProfile = async (req, res) => {
  try {
    console.log("createProfile req.body:", req.body);

    let {
      name,
      age,
      address,
      phone,
      shift_time,
      experience,
      job_title,
      salary_expectation,
    } = req.body;

    const numericAge = Number(age);
    const numericExp = Number(experience);
    const numericSalary = Number(salary_expectation);

    if (!name || !job_title) {
      return res.status(400).json({
        success: false,
        message: "Missing required text fields (name, job_title).",
      });
    }

    if (
      Number.isNaN(numericAge) ||
      Number.isNaN(numericExp) ||
      Number.isNaN(numericSalary)
    ) {
      return res.status(400).json({
        success: false,
        message: "Age, experience, and salary must be valid numbers.",
      });
    }

    if (numericAge <= 0 || numericExp < 0 || numericSalary <= 0) {
      return res.status(400).json({
        success: false,
        message: "Age, experience, and salary must be positive values.",
      });
    }

    const newUser = new User({
      name,
      age: numericAge,
      address,
      phone,
      shift_time,
      experience: numericExp,
      job_title,
      salary_expectation: numericSalary,
    });

    await newUser.save();

    // ---------- JOB RECOMMENDATION LOGIC ----------
    // 1. Base query: age + title text
    let baseQuery = {
      minAge: { $lte: numericAge },
      jobName: { $regex: new RegExp(job_title, "i") }, // "driver", "security", etc.
    };

    // Only constrain availability if user did NOT say "flexible"
    if (
      shift_time &&
      shift_time.toLowerCase() !== "flexible" &&
      shift_time.toLowerCase() !== "any"
    ) {
      baseQuery.availability = { $regex: new RegExp(shift_time, "i") };
    }

    let recommendedJobs = await Job.find(baseQuery).limit(5);

    // 2. If still nothing, relax availability filter
    if (!recommendedJobs.length) {
      const relaxedQuery = {
        minAge: { $lte: numericAge },
        jobName: { $regex: new RegExp(job_title, "i") },
      };
      recommendedJobs = await Job.find(relaxedQuery).limit(5);
    }

    // 3. If still nothing, fall back to category (if we can guess)
    if (!recommendedJobs.length) {
      // naive mapping from job_title -> category
      const titleLower = job_title.toLowerCase();
      let category = null;
      if (titleLower.includes("driver")) category = "driver";
      else if (titleLower.includes("cook") || titleLower.includes("chef"))
        category = "cook";
      else if (titleLower.includes("security")) category = "other"; // or some category you want
      // add more mappings as needed

      if (category) {
        recommendedJobs = await Job.find({
          category,
          minAge: { $lte: numericAge },
        }).limit(5);
      }
    }

    // 4. Final fallback – just give some jobs so page is not empty
    if (!recommendedJobs.length) {
      recommendedJobs = await Job.find().limit(5);
    }
    // ---------- END JOB RECOMMENDATION LOGIC ----------

    return res.status(201).json({
      success: true,
      message: "Profile created successfully!",
      profileId: newUser._id,
      user: newUser,
      recommendedJobs,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating profile.",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  linkUserProfile,
  createProfile,
};
