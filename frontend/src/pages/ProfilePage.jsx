// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { currentUser, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Load language + check auth + load profile from localStorage
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

    // 🔹 Load worker profile created via AI assistant
    const storedProfile = localStorage.getItem("workerProfile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
      } catch (e) {
        console.error("Error parsing workerProfile from localStorage:", e);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }

    setLoading(false);
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

  return (
    <div className="profile-page">
      <NavigationBar
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="profile-container">
        <h1>{content[language].title}</h1>

        {profile ? (
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
              <Link to="/assistant" className="profile-action-btn">
                {content[language].updateProfile}
              </Link>
              <Link to="/jobs" className="profile-action-btn secondary">
                {content[language].viewJobs}
              </Link>
            </div>
          </div>
        ) : (
          <div className="no-profile">
            <p>{content[language].noProfileFound}</p>
            <Link to="/assistant" className="profile-action-btn">
              {content[language].completeProfile}
            </Link>
          </div>
        )}
      </div>

      <Footer language={language} />
    </div>
  );
};

export default ProfilePage;
