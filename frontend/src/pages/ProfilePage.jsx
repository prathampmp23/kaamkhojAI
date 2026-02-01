// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import axios from "axios";
import "./ProfilePage.css";

const API_URL = import.meta.env.VITE_API_URL || "https://kaamkhojaibackend.onrender.com";

const JOB_TITLE_OPTIONS = [
  "driver",
  "cook",
  "cleaner",
  "gardener",
  "plumber",
  "electrician",
  "security",
  "factory",
  "construction",
  "house-help",
  "office-helper",
  "other",
];

const SHIFT_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "weekends", label: "Weekends" },
  { value: "flexible", label: "Flexible" },
];

const normalizePhone = (value) => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  const normalized = digits.length > 10 ? digits.slice(-10) : digits;
  return normalized;
};

const ProfilePage = () => {
  const { currentUser, isAuthenticated, setCurrentUser } = useAuthContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    address: "",
    shift_time: "",
    experience: "",
    job_title: "",
    salary_expectation: "",
  });

  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  const content = {
    hi: {
      title: "प्रोफाइल",
      loading: "लोड हो रहा है...",
      notLoggedIn: "आप लॉग इन नहीं हैं। कृपया पहले लॉगिन करें।",
      personalInfo: "व्यक्तिगत जानकारी",
      name: "नाम",
      email: "ईमेल",
      age: "उम्र",
      phone: "फोन नंबर",
      address: "पता",
      shift: "पसंदीदा शिफ्ट",
      experienceYears: "अनुभव (साल)",
      jobTitle: "नौकरी का प्रकार",
      salaryExpectation: "अपेक्षित वेतन (मासिक)",
      noProfileFound: "कोई प्रोफाइल नहीं मिला",
      loginPrompt: "लॉगिन करने के लिए",
      clickHere: "यहां क्लिक करें",
      completeProfile: "अपनी प्रोफाइल पूरी करें",
      updateProfile: "प्रोफाइल अपडेट करें",
      editManually: "मैन्युअल रूप से एडिट करें",
      save: "सेव करें",
      cancel: "कैंसिल",
      createProfileManual: "मैन्युअल प्रोफाइल बनाएं",
      updateProfileManual: "मैन्युअल प्रोफाइल अपडेट करें",
      profileForSeekerOnly: "मैन्युअल प्रोफाइल (Job Seeker) के लिए है।",
      required: "* जरूरी",
      shiftSelect: "शिफ्ट चुनें",
      jobTypeSelect: "काम का प्रकार चुनें",
      fromAssistantNote:
        "यह प्रोफाइल AI सहायक से भरी गई जानकारी पर आधारित है।",
      viewJobs: "नौकरियां देखें",
    },
    en: {
      title: "Profile",
      loading: "Loading...",
      notLoggedIn: "You are not logged in. Please login first.",
      personalInfo: "Personal Information",
      name: "Name",
      email: "Email",
      age: "Age",
      phone: "Phone Number",
      address: "Address",
      shift: "Preferred Shift",
      experienceYears: "Experience (years)",
      jobTitle: "Job Type",
      salaryExpectation: "Expected Salary (monthly)",
      noProfileFound: "No profile found",
      loginPrompt: "To login",
      clickHere: "click here",
      completeProfile: "Complete Your Profile",
      updateProfile: "Update Profile",
      editManually: "Edit Manually",
      save: "Save",
      cancel: "Cancel",
      createProfileManual: "Create Profile Manually",
      updateProfileManual: "Update Profile Manually",
      profileForSeekerOnly: "Manual profile is for Job Seekers only.",
      required: "* required",
      shiftSelect: "Select shift",
      jobTypeSelect: "Select job type",
      fromAssistantNote:
        "This profile is based on information collected via the AI assistant.",
      viewJobs: "View Jobs",
    },
    mr: {
      title: "प्रोफाइल",
      loading: "लोड होत आहे...",
      notLoggedIn: "आपण लॉगिन केलेले नाही. कृपया आधी लॉगिन करा.",
      personalInfo: "वैयक्तिक माहिती",
      name: "नाव",
      email: "ईमेल",
      age: "वय",
      phone: "फोन नंबर",
      address: "पत्ता",
      shift: "आवडती शिफ्ट",
      experienceYears: "अनुभव (वर्षे)",
      jobTitle: "नोकरीचा प्रकार",
      salaryExpectation: "अपेक्षित पगार (महिना)",
      noProfileFound: "प्रोफाइल सापडले नाही",
      loginPrompt: "लॉगिन करण्यासाठी",
      clickHere: "इथे क्लिक करा",
      completeProfile: "आपले प्रोफाइल पूर्ण करा",
      updateProfile: "प्रोफाइल अपडेट करा",
      editManually: "मॅन्युअली एडिट करा",
      save: "सेव्ह करा",
      cancel: "कॅन्सल",
      createProfileManual: "मॅन्युअल प्रोफाइल बनवा",
      updateProfileManual: "मॅन्युअल प्रोफाइल अपडेट करा",
      profileForSeekerOnly: "मॅन्युअल प्रोफाइल (Job Seeker) साठी आहे.",
      required: "* आवश्यक",
      shiftSelect: "शिफ्ट निवडा",
      jobTypeSelect: "कामाचा प्रकार निवडा",
      fromAssistantNote:
        "हे प्रोफाइल AI सहाय्याकडून गोळा केलेल्या माहितीवर आधारित आहे.",
      viewJobs: "नोकऱ्या पहा",
    },
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem("preferredLanguage", lang);
    } catch {}
    i18n.changeLanguage(lang);
  };

  const setProfileEverywhere = (p) => {
    setProfile(p);
    try {
      if (p) localStorage.setItem("workerProfile", JSON.stringify(p));
      else localStorage.removeItem("workerProfile");
    } catch {}

    // Keep auth user in sync for features that use profileCompleted/profileId
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser && p?._id) {
        const parsed = JSON.parse(rawUser);
        const updated = {
          ...parsed,
          profileCompleted: true,
          profileId: p._id,
        };
        localStorage.setItem("user", JSON.stringify(updated));
        setCurrentUser(updated);
      }
    } catch {}
  };

  const hydrateFormFromProfile = (p) => {
    setForm({
      name: p?.name || "",
      age: p?.age ?? "",
      phone: p?.phone || (currentUser?.phone || ""),
      address: p?.address || "",
      shift_time: p?.shift_time || "",
      experience: p?.experience ?? "",
      job_title: p?.job_title || "",
      salary_expectation: p?.salary_expectation ?? "",
    });
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const p = res?.data?.profile || null;
    setProfileEverywhere(p);
    hydrateFormFromProfile(p);
    // If no profile yet, open manual create form
    setEditMode(!p);
  };

  const validateForm = () => {
    const name = String(form.name || "").trim();
    const jobTitle = String(form.job_title || "").trim();
    const shift = String(form.shift_time || "").trim();

    const age = Number(form.age);
    const experience = Number(form.experience);
    const salary = Number(form.salary_expectation);
    const phone = normalizePhone(form.phone);

    if (!name) return "Name is required";
    if (!jobTitle) return "Job type is required";
    if (!shift) return "Shift is required";
    if (!Number.isFinite(age) || age <= 0) return "Age must be a valid number";
    if (!Number.isFinite(experience) || experience < 0)
      return "Experience must be a valid number";
    if (!Number.isFinite(salary) || salary <= 0)
      return "Salary must be a valid number";
    if (form.phone && phone.length !== 10) return "Phone must be 10 digits";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    const role = String(currentUser?.role || "seeker").toLowerCase();
    if (role !== "seeker") {
      setSaveError(content[language].profileForSeekerOnly);
      return;
    }

    const err = validateForm();
    if (err) {
      setSaveError(err);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = {
      name: String(form.name || "").trim(),
      age: Number(form.age),
      phone: normalizePhone(form.phone) || undefined,
      address: String(form.address || "").trim(),
      shift_time: String(form.shift_time || "").trim(),
      experience: Number(form.experience),
      job_title: String(form.job_title || "").trim(),
      salary_expectation: Number(form.salary_expectation),
    };

    setSaving(true);
    try {
      if (!profile) {
        const res = await axios.post(`${API_URL}/api/auth/create-profile`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const saved = res?.data?.user || null;
        setProfileEverywhere(saved);
        hydrateFormFromProfile(saved);
        setEditMode(false);
        setSaveSuccess("Profile saved");
      } else {
        const res = await axios.put(`${API_URL}/api/auth/profile`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const saved = res?.data?.profile || null;
        setProfileEverywhere(saved);
        hydrateFormFromProfile(saved);
        setEditMode(false);
        setSaveSuccess("Profile updated");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save profile";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  // Load language + check auth + load profile from backend
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        await fetchProfile();
      } catch (e) {
        console.error("Error loading profile:", e);
        setProfileEverywhere(null);
        setEditMode(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, navigate, i18n]);

  // keep local language in sync with i18n changes triggered elsewhere (e.g., navbar)
  useEffect(() => {
    setLanguage(i18n.language || "en");
  }, [i18n.language]);

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <NavigationBar
          language={language}
          onLanguageChange={handleLanguageChange}
        />
        <div className="profile-container">
          <div className="not-logged-in">
            <h2>{content[language].notLoggedIn}</h2>
            <p>
              {content[language].loginPrompt}{" "}
              <Link to="/login">{content[language].clickHere}</Link>
            </p>
          </div>
        </div>
        <Footer language={language} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <NavigationBar
          language={language}
          onLanguageChange={handleLanguageChange}
        />
        <div className="profile-container loading">
          <p>{content[language].loading}</p>
        </div>
        <Footer language={language} />
      </div>
    );
  }

  const role = String(currentUser?.role || "seeker").toLowerCase();

  const renderProfileForm = () => (
    <div className="profile-section">
      <h2>
        {profile
          ? content[language].updateProfileManual
          : content[language].createProfileManual}
      </h2>

      {saveError && <div className="profile-form-alert error">{saveError}</div>}
      {saveSuccess && (
        <div className="profile-form-alert success">{saveSuccess}</div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label>
              {content[language].name} {content[language].required}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={content[language].name}
            />
          </div>

          <div className="form-field">
            <label>
              {content[language].age} {content[language].required}
            </label>
            <input
              type="number"
              min="1"
              value={form.age}
              onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
              placeholder={content[language].age}
            />
          </div>

          <div className="form-field">
            <label>{content[language].phone}</label>
            <input
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="10-digit phone"
            />
          </div>

          <div className="form-field">
            <label>{content[language].address}</label>
            <input
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              placeholder={content[language].address}
            />
          </div>

          <div className="form-field">
            <label>
              {content[language].shift} {content[language].required}
            </label>
            <select
              value={form.shift_time}
              onChange={(e) =>
                setForm((p) => ({ ...p, shift_time: e.target.value }))
              }
            >
              <option value="">{content[language].shiftSelect}</option>
              {SHIFT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>
              {content[language].experienceYears} {content[language].required}
            </label>
            <input
              type="number"
              min="0"
              value={form.experience}
              onChange={(e) =>
                setForm((p) => ({ ...p, experience: e.target.value }))
              }
              placeholder={content[language].experienceYears}
            />
          </div>

          <div className="form-field">
            <label>
              {content[language].jobTitle} {content[language].required}
            </label>
            <select
              value={form.job_title}
              onChange={(e) =>
                setForm((p) => ({ ...p, job_title: e.target.value }))
              }
            >
              <option value="">{content[language].jobTypeSelect}</option>
              {JOB_TITLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>
              {content[language].salaryExpectation} {content[language].required}
            </label>
            <input
              type="number"
              min="1"
              value={form.salary_expectation}
              onChange={(e) =>
                setForm((p) => ({ ...p, salary_expectation: e.target.value }))
              }
              placeholder={content[language].salaryExpectation}
            />
          </div>
        </div>

        <div className="profile-form-actions">
          <button
            type="submit"
            className="form-btn primary"
            disabled={saving}
          >
            {saving ? "Saving..." : content[language].save}
          </button>

          {profile && (
            <button
              type="button"
              className="form-btn secondary"
              onClick={() => {
                hydrateFormFromProfile(profile);
                setEditMode(false);
                setSaveError(null);
                setSaveSuccess(null);
              }}
              disabled={saving}
            >
              {content[language].cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );

  return (
    <div className="profile-page">
      <NavigationBar
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="profile-container">
        <h1>{content[language].title}</h1>

        {role !== "seeker" && (
          <div className="profile-section">
            <div className="no-profile">
              <p>{content[language].profileForSeekerOnly}</p>
              <div className="profile-actions">
                <Link to="/dashboard" className="profile-action-btn">
                  Dashboard
                </Link>
                <Link to="/jobs" className="profile-action-btn secondary">
                  {content[language].viewJobs}
                </Link>
              </div>
            </div>
          </div>
        )}

        {role === "seeker" && editMode && renderProfileForm()}

        {role === "seeker" && !editMode && profile ? (
          <div className="profile-content">
            <p className="assistant-note">
              {content[language].fromAssistantNote}
            </p>

            <div className="profile-section personal-info">
              <h2>{content[language].personalInfo}</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">{content[language].name}:</span>
                  <span className="value">{profile.name || "-"}</span>
                </div>

                <div className="info-item">
                  <span className="label">{content[language].email}:</span>
                  <span className="value">
                    {currentUser?.email || "—"}
                  </span>
                </div>

                <div className="info-item">
                  <span className="label">{content[language].age}:</span>
                  <span className="value">
                    {profile.age !== undefined && profile.age !== null
                      ? profile.age
                      : "-"}
                  </span>
                </div>

                <div className="info-item">
                  <span className="label">{content[language].phone}:</span>
                  <span className="value">{profile.phone || "-"}</span>
                </div>

                <div className="info-item">
                  <span className="label">{content[language].address}:</span>
                  <span className="value">{profile.address || "-"}</span>
                </div>

                <div className="info-item">
                  <span className="label">{content[language].shift}:</span>
                  <span className="value">
                    {profile.shift_time || profile.availability || "-"}
                  </span>
                </div>

                <div className="info-item">
                  <span className="label">
                    {content[language].experienceYears}:
                  </span>
                  <span className="value">
                    {profile.experience !== undefined &&
                    profile.experience !== null
                      ? `${profile.experience}`
                      : "-"}
                  </span>
                </div>

                <div className="info-item">
                  <span className="label">{content[language].jobTitle}:</span>
                  <span className="value">{profile.job_title || "-"}</span>
                </div>

                <div className="info-item">
                  <span className="label">
                    {content[language].salaryExpectation}:
                  </span>
                  <span className="value">
                    {profile.salary_expectation
                      ? `₹${profile.salary_expectation}`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-action-btn"
                onClick={() => {
                  hydrateFormFromProfile(profile);
                  setEditMode(true);
                  setSaveError(null);
                  setSaveSuccess(null);
                }}
              >
                {content[language].updateProfile}
              </button>

              <Link to="/jobs" className="profile-action-btn secondary">
                {content[language].viewJobs}
              </Link>
            </div>
          </div>
        ) : role === "seeker" && !editMode ? (
          <div className="no-profile">
            <p>{content[language].noProfileFound}</p>
            <div className="profile-actions">
              <button
                type="button"
                className="profile-action-btn"
                onClick={() => {
                  hydrateFormFromProfile(null);
                  setEditMode(true);
                  setSaveError(null);
                  setSaveSuccess(null);
                }}
              >
                {content[language].createProfileManual}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Footer language={language} />
    </div>
  );
};

export default ProfilePage;
