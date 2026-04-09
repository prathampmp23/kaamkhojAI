import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import Notification from "../components/Notification";
import useAuth from "../hooks/useAuth";
import "./LoginPage.css";

export default function LoginPage() {
  const { i18n } = useTranslation();
  const [formData, setFormData] = useState({
    role: "seeker",
    email: "",
    otp: "",
    phone: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [otpInfo, setOtpInfo] = useState("");
  const [notification, setNotification] = useState(null);
  const [language, setLanguage] = useState(i18n.language || "en");
  const { isLoading, error, login, sendEmailOtp, setError } = useAuth();
  const location = useLocation();
  
  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // keep local language in sync with i18n changes triggered elsewhere (e.g., navbar)
  useEffect(() => {
    setLanguage(i18n.language || "en");
  }, [i18n.language]);
  
  // Check if user was redirected from registration
  useEffect(() => {
    if (location.state?.registered) {
      setNotification({
        type: 'success',
        message: content[language].registrationSuccess
      });
    }
  }, [location, language]);
  
  // Translation content
  const content = {
    hi: {
      welcomeBack: "वापसी पर स्वागत है",
      enterCredentials: "कृपया अपनी लॉगिन जानकारी दर्ज करें",
      roleLabel: "मैं हूँ",
      roleSeeker: "नौकरी खोजने वाला",
      roleGiver: "नौकरी देने वाला",
      phone: "फोन नंबर",
      enterPhone: "10 अंकों का फोन नंबर दर्ज करें",
      email: "ईमेल",
      enterEmail: "अपना ईमेल दर्ज करें",
      otp: "OTP",
      enterOtp: "6 अंकों का OTP दर्ज करें",
      sendOtp: "OTP भेजें",
      otpSent: "OTP आपके ईमेल पर भेजा गया है",
      pin: "PIN",
      enterPin: "अपना PIN दर्ज करें",
      rememberMe: "मुझे याद रखें",
      forgotPassword: "पासवर्ड भूल गए?",
      login: "लॉग इन",
      loggingIn: "लॉगिन हो रहा है...",
      orLoginWith: "या इसके साथ लॉग इन करें",
      dontHaveAccount: "खाता नहीं है?",
      signUp: "साइन अप",
      phoneRequired: "फोन नंबर आवश्यक है",
      phoneInvalid: "कृपया सही 10 अंकों का फोन नंबर डालें",
      emailRequired: "ईमेल आवश्यक है",
      invalidEmail: "ईमेल पता अमान्य है",
      otpRequired: "OTP आवश्यक है",
      otpInvalid: "कृपया सही 6 अंकों का OTP डालें",
      pinRequired: "PIN आवश्यक है",
      pinLength: "PIN कम से कम 4 अंकों का होना चाहिए",
      registrationSuccess: "पंजीकरण सफल! अब आप लॉग इन कर सकते हैं।",
    },
    mr: {
      welcomeBack: "पुन्हा स्वागत आहे",
      enterCredentials: "कृपया लॉगिन माहिती भरा",
      roleLabel: "मी आहे",
      roleSeeker: "नोकरी शोधणारा",
      roleGiver: "नोकरी देणारा",
      phone: "फोन नंबर",
      enterPhone: "10 अंकी फोन नंबर भरा",
      email: "ईमेल",
      enterEmail: "आपला ईमेल भरा",
      otp: "OTP",
      enterOtp: "6 अंकी OTP भरा",
      sendOtp: "OTP पाठवा",
      otpSent: "OTP आपल्या ईमेलवर पाठवला आहे",
      pin: "PIN",
      enterPin: "आपला PIN भरा",
      rememberMe: "मला लक्षात ठेवा",
      forgotPassword: "पासवर्ड विसरलात?",
      login: "लॉगिन",
      loggingIn: "लॉगिन चालू आहे...",
      orLoginWith: "किंवा याने लॉगिन करा",
      dontHaveAccount: "खाते नाही?",
      signUp: "साइन अप",
      phoneRequired: "फोन नंबर आवश्यक आहे",
      phoneInvalid: "कृपया योग्य 10 अंकी फोन नंबर टाका",
      emailRequired: "ईमेल आवश्यक आहे",
      invalidEmail: "ईमेल पत्ता अवैध आहे",
      otpRequired: "OTP आवश्यक आहे",
      otpInvalid: "कृपया योग्य 6 अंकी OTP टाका",
      pinRequired: "PIN आवश्यक आहे",
      pinLength: "PIN किमान 4 अंकांचा असावा",
      registrationSuccess: "नोंदणी यशस्वी! आता आपण लॉगिन करू शकता.",
    },
    en: {
      welcomeBack: "Welcome Back",
      enterCredentials: "Please enter your credentials to login",
      roleLabel: "I am a",
      roleSeeker: "Job seeker",
      roleGiver: "Job giver",
      phone: "Phone Number",
      enterPhone: "Enter 10-digit phone number",
      email: "Email",
      enterEmail: "Enter your email",
      otp: "OTP",
      enterOtp: "Enter 6-digit OTP",
      sendOtp: "Send OTP",
      otpSent: "OTP has been sent to your email",
      pin: "PIN",
      enterPin: "Enter your PIN",
      rememberMe: "Remember me",
      forgotPassword: "Forgot Password?",
      login: "Login",
      loggingIn: "Logging in...",
      orLoginWith: "or login with",
      dontHaveAccount: "Don't have an account?",
      signUp: "Sign Up",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Please enter a valid 10-digit phone number",
      emailRequired: "Email is required",
      invalidEmail: "Email address is invalid",
      otpRequired: "OTP is required",
      otpInvalid: "Please enter a valid 6-digit OTP",
      pinRequired: "PIN is required",
      pinLength: "PIN must be at least 4 digits",
      registrationSuccess: "Registration successful! You can now log in.",
    },
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    try { localStorage.setItem("preferredLanguage", lang); } catch {}
    i18n.changeLanguage(lang);
  };
  
  // Set error from auth hook to our local errors state
  useEffect(() => {
    if (error) {
      setErrors({ general: error });
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "email" || name === "role") {
      setOtpInfo("");
    }
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    
    // Clear general error when typing
    if (errors.general) {
      setErrors({
        ...errors,
        general: "",
      });
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.role === "giver") {
      if (!formData.email) {
        newErrors.email = content[language].emailRequired;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = content[language].invalidEmail;
      }

      if (!formData.otp) {
        newErrors.otp = content[language].otpRequired;
      } else if (!/^\d{6}$/.test(formData.otp)) {
        newErrors.otp = content[language].otpInvalid;
      }
    } else {
      const digits = (formData.phone || "").replace(/\D/g, "");
      const normalized = digits.length > 10 ? digits.slice(-10) : digits;
      if (!normalized) {
        newErrors.phone = content[language].phoneRequired;
      } else if (normalized.length !== 10) {
        newErrors.phone = content[language].phoneInvalid;
      }

      if (!formData.password) {
        newErrors.password = content[language].pinRequired;
      } else if (formData.password.length < 4) {
        newErrors.password = content[language].pinLength;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    const email = String(formData.email || "").trim();
    if (!email) {
      setErrors((prev) => ({ ...prev, email: content[language].emailRequired }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: content[language].invalidEmail }));
      return;
    }

    const result = await sendEmailOtp({ email, purpose: "login" });
    if (result.success) {
      setOtpInfo(content[language].otpSent);
      setErrors((prev) => ({ ...prev, email: "", otp: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Use the login function from our custom hook
    login(
      formData.role === "giver"
        ? {
            role: "giver",
            email: formData.email,
            otp: formData.otp,
            rememberMe: formData.rememberMe,
          }
        : {
            role: "seeker",
            phone: formData.phone,
            password: formData.password,
            rememberMe: formData.rememberMe,
          }
    );
  };

  return (
    <>
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)}
        />
      )}
      <div className="login-container">
        <div className="login-overlay"></div>
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">{content[language].welcomeBack}</h1>
            <p className="login-subtitle">{content[language].enterCredentials}</p>
          </div>

          <div className="language-buttons" style={{ marginBottom: 10 }}>
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => handleLanguageChange("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={language === "hi" ? "active" : ""}
              onClick={() => handleLanguageChange("hi")}
            >
              HI
            </button>
            <button
              type="button"
              className={language === "mr" ? "active" : ""}
              onClick={() => handleLanguageChange("mr")}
            >
              MR
            </button>
          </div>
          
          {errors.general && (
            <div className="alert alert-danger" role="alert">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">{content[language].roleLabel}</label>
              <div className="role-selection-wrapper">
                <button
                  type="button"
                  className={`role-option-btn ${formData.role === "seeker" ? "active" : ""}`}
                  onClick={() =>
                    handleChange({ target: { name: "role", value: "seeker" } })
                  }
                >
                  {content[language].roleSeeker}
                </button>
                <button
                  type="button"
                  className={`role-option-btn ${formData.role === "giver" ? "active" : ""}`}
                  onClick={() =>
                    handleChange({ target: { name: "role", value: "giver" } })
                  }
                >
                  {content[language].roleGiver}
                </button>
              </div>
            </div>

            {formData.role === "giver" ? (
              <>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    {content[language].email}
                  </label>
                  <input
                    name="email"
                    id="email"
                    type="email"
                    placeholder={content[language].enterEmail}
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group otp-send-group">
                  <button
                    type="button"
                    className="btn-send-otp"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    {content[language].sendOtp}
                  </button>
                  {otpInfo && <span className="otp-info-message">{otpInfo}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    {content[language].otp}
                  </label>
                  <input
                    name="otp"
                    id="otp"
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    placeholder={content[language].enterOtp}
                    className={`form-control ${errors.otp ? "is-invalid" : ""}`}
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                  {errors.otp && <span className="error-message">{errors.otp}</span>}
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    {content[language].phone}
                  </label>
                  <input
                    name="phone"
                    id="phone"
                    type="text"
                    placeholder={content[language].enterPhone}
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    {content[language].pin}
                  </label>
                  <input
                    name="password"
                    id="password"
                    type="password"
                    placeholder={content[language].enterPin}
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>
              </>
            )}
            
            <div className="remember-forgot">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">{content[language].rememberMe}</label>
              </div>
              {/* <Link to="/forgot-password" className="forgot-password">
                {content[language].forgotPassword}
              </Link> */}
            </div>
            
            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? content[language].loggingIn : content[language].login}
            </button>
          </form>
          
          {/* <div className="login-divider">
            <span className="login-divider-text">{content[language].orLoginWith}</span>
          </div>
          
          <div className="social-login">
            <button className="social-button" type="button">
              <i className="fab fa-google"></i>
            </button>
          </div> */}
          
          <div className="signup-link-container">
            <span className="signup-text">
              {content[language].dontHaveAccount} <Link to="/signup" className="signup-link">{content[language].signUp}</Link>
            </span>
          </div>
        </div>
      </div>
      <Footer language={language} />
    </>
  );
}
