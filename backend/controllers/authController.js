const AuthUser = require("../models/authUser");
const User = require("../models/user");
const Job = require("../models/job");
const { generateToken } = require("../utils/jwt");

const normalizePhone = (value) => {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  // India-centric: keep last 10 digits if country code included
  const normalized = digits.length > 10 ? digits.slice(-10) : digits;
  if (normalized.length !== 10) return null;
  return normalized;
};

const isLikelyPhone = (value) => {
  const p = normalizePhone(value);
  return !!p;
};

const normalizeRole = (role) => {
  if (!role) return null;
  const r = String(role).trim().toLowerCase();
  if (r === 'job seeker' || r === 'jobseeker' || r === 'seeker') return 'seeker';
  if (r === 'job giver' || r === 'jobgiver' || r === 'giver') return 'giver';
  return null;
};

const generateUsernameFromPhone = async (phone) => {
  const base = `u_${phone}`;
  // Usually unique because phone is unique; but keep a fallback.
  const exists = await AuthUser.findOne({ username: base });
  if (!exists) return base;
  return `${base}_${Math.floor(Math.random() * 9000 + 1000)}`;
};

// Check if a phone already has an account (used by AI assistant flow)
const checkPhone = async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    const authUser = await AuthUser.findOne({ phone }).select(
      "_id role profileCompleted profileId"
    );

    if (!authUser) {
      return res.status(200).json({
        success: true,
        exists: false,
      });
    }

    let profileName = null;
    if (authUser.profileId) {
      const profile = await User.findById(authUser.profileId).select("name");
      profileName = profile?.name || null;
    }

    return res.status(200).json({
      success: true,
      exists: true,
      role: authUser.role,
      profileCompleted: !!authUser.profileCompleted,
      profileName,
    });
  } catch (error) {
    console.error("Phone check error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during phone check",
      error: error.message,
    });
  }
};

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password, role, phone: phoneRaw } = req.body;
    const normalizedRole = normalizeRole(role) || 'seeker';

    const phone = normalizePhone(phoneRaw);
    const hasPhone = !!phone;

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a password/PIN",
      });
    }

    if (!hasPhone && !username && !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone number (recommended) or username/email",
      });
    }

    if (phoneRaw && !hasPhone) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    // phone uniqueness
    if (hasPhone) {
      const existingPhone = await AuthUser.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "This phone number is already registered. Please login.",
        });
      }
    }

    let finalUsername = username;
    if (!finalUsername && hasPhone) {
      finalUsername = await generateUsernameFromPhone(phone);
    }

    // Check if username already exists
    if (finalUsername) {
      const existingUsername = await AuthUser.findOne({ username: finalUsername });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await AuthUser.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered",
        });
      }
    }

    // Create new user
    const user = new AuthUser({
      username: finalUsername,
      email: email || undefined,
      phone: phone || undefined,
      password,
      role: normalizedRole,
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
        phone: user.phone,
        role: user.role,
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
    const { username, password, phone: phoneRaw, identifier } = req.body;

    const phone = normalizePhone(phoneRaw || identifier);
    const usernameOrIdentifier = username || identifier;

    // Validation
    if ((!usernameOrIdentifier && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone/username and password/PIN",
      });
    }

    // Find user by phone (preferred) or username
    const query = phone
      ? { phone }
      : { username: usernameOrIdentifier };

    const user = await AuthUser.findOne(query);
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
        phone: user.phone,
        role: user.role,
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
        phone: user.phone,
        role: user.role,
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
      { new: true },
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
        role: updatedUser.role,
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

// Create or update a user profile
// FIXED: Now properly protected by authMiddleware and uses req.user._id
const createProfile = async (req, res) => {
  try {
    // DEBUG: Log the AuthUser ID
    console.log('[DEBUG createProfile] AuthUser ID:', req.user._id);
    
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
        message: "Missing required fields (name, job_title)",
      });
    }

    if (
      Number.isNaN(numericAge) ||
      Number.isNaN(numericExp) ||
      Number.isNaN(numericSalary)
    ) {
      return res.status(400).json({
        success: false,
        message: "Age, experience, and salary must be valid numbers",
      });
    }

    // CRITICAL: Fetch the AuthUser to check if profileId already exists
    const authUser = await AuthUser.findById(req.user._id);
    
    // DEBUG: Log current profileId value
    console.log('[DEBUG createProfile] Current profileId:', authUser.profileId);

    // Bind AuthUser.phone on first profile creation; reject mismatched updates
    const normalizedProfilePhone = normalizePhone(phone);
    if (phone && !normalizedProfilePhone) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    if (normalizedProfilePhone) {
      if (!authUser.phone) {
        const existingPhone = await AuthUser.findOne({ phone: normalizedProfilePhone });
        if (existingPhone && String(existingPhone._id) !== String(authUser._id)) {
          return res.status(400).json({
            success: false,
            message: "This phone number is already linked to another account",
          });
        }
        authUser.phone = normalizedProfilePhone;
        await authUser.save();
      } else if (normalizePhone(authUser.phone) !== normalizedProfilePhone) {
        return res.status(403).json({
          success: false,
          message: "Phone number mismatch. You cannot change phone number from profile form.",
        });
      }
    }

    let userProfile;

    if (authUser.profileId) {
      // CASE 1: Profile already exists → UPDATE IT
      console.log('[DEBUG createProfile] Updating existing profile:', authUser.profileId);
      
      userProfile = await User.findByIdAndUpdate(
        authUser.profileId,
        {
          name,
          age: numericAge,
          address,
          phone,
          shift_time,
          experience: numericExp,
          job_title,
          salary_expectation: numericSalary,
        },
        { new: true }
      );
      
      if (!userProfile) {
        // Profile ID exists but profile is missing → create new and relink
        console.log('[DEBUG createProfile] Profile missing, creating new one');
        
        userProfile = new User({
          name,
          age: numericAge,
          address,
          phone,
          shift_time,
          experience: numericExp,
          job_title,
          salary_expectation: numericSalary,
        });
        
        await userProfile.save();
        
        // Update AuthUser with new profile ID
        await AuthUser.findByIdAndUpdate(req.user._id, {
          profileId: userProfile._id,
          profileCompleted: true,
        });
        
        console.log('[DEBUG createProfile] New profile created and linked:', userProfile._id);
      }
    } else {
      // CASE 2: No profile exists → CREATE ONE and link it ONCE
      console.log('[DEBUG createProfile] Creating new profile');
      
      userProfile = new User({
        name,
        age: numericAge,
        address,
        phone,
        shift_time,
        experience: numericExp,
        job_title,
        salary_expectation: numericSalary,
      });

      await userProfile.save();
      
      console.log('[DEBUG createProfile] Profile created:', userProfile._id);

      // CRITICAL: Link profile to AuthUser ONCE
      await AuthUser.findByIdAndUpdate(req.user._id, {
        profileId: userProfile._id,
        profileCompleted: true,
      });
      
      console.log('[DEBUG createProfile] Profile linked to AuthUser');
    }

    // Get recommended jobs (unchanged logic)
    let recommendedJobs = await Job.find({ status: "active" }).limit(5);

    return res.status(201).json({
      success: true,
      message: authUser.profileId ? "Profile updated successfully" : "Profile created successfully",
      profileId: userProfile._id,
      user: userProfile,
      recommendedJobs,
    });
  } catch (error) {
    console.error("[ERROR createProfile]", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating/updating profile",
      error: error.message,
    });
  }
};

// Get the currently authenticated user's profile (User model)
const getUserProfile = async (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser?.profileId) {
      return res.status(200).json({ success: true, profile: null });
    }

    const profile = await User.findById(authUser.profileId);
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message,
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const authUserId = req.user._id;

    // Get the AuthUser to find profileId
    const authUser = await AuthUser.findById(authUserId);
    if (!authUser || !authUser.profileId) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create a profile first.",
      });
    }

    const updates = req.body;

    // Phone security: bind AuthUser.phone once; prevent changing it later
    if (Object.prototype.hasOwnProperty.call(updates, 'phone')) {
      const normalized = normalizePhone(updates.phone);
      if (updates.phone && !normalized) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit phone number',
        });
      }

      if (normalized) {
        if (!authUser.phone) {
          const existingPhone = await AuthUser.findOne({ phone: normalized });
          if (existingPhone && String(existingPhone._id) !== String(authUser._id)) {
            return res.status(400).json({
              success: false,
              message: 'This phone number is already linked to another account',
            });
          }
          authUser.phone = normalized;
          await authUser.save();
        } else if (normalizePhone(authUser.phone) !== normalized) {
          return res.status(403).json({
            success: false,
            message: 'Phone number mismatch. You cannot change your phone number.',
          });
        }

        // Keep profile phone normalized too
        updates.phone = normalized;
      }
    }

    // Find the User profile
    const userProfile = await User.findById(authUser.profileId);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update allowed fields
    if (updates.name) userProfile.name = updates.name;
    if (updates.age) userProfile.age = updates.age;
    if (updates.phone) userProfile.phone = updates.phone;
    if (updates.address) userProfile.address = updates.address;
    if (updates.shift_time) userProfile.shift_time = updates.shift_time;
    if (updates.experience !== undefined)
      userProfile.experience = updates.experience;
    if (updates.job_title) userProfile.job_title = updates.job_title;
    if (updates.salary_expectation)
      userProfile.salary_expectation = updates.salary_expectation;

    // CRITICAL: Invalidate recommendations cache
    userProfile.cachedRecommendations = [];
    userProfile.recommendationsLastUpdated = null;
    userProfile.profileHash = null;

    await userProfile.save();

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully. Recommendations will be refreshed.",
      profile: userProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  checkPhone,
  getCurrentUser,
  linkUserProfile,
  createProfile,
  updateUserProfile,
  getUserProfile,
};