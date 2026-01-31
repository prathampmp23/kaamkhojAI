import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth";
import "./SignupPage.css";

export default function SignupPage() {
  const { i18n } = useTranslation();
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker",
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState(i18n.language || "en");
  const { isLoading, error, register, setError } = useAuth();
  
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
  
  // Translation content
  const content = {
    hi: {
      createAccount: "खाता बनाएँ",
      joinKaamkhoj: "नौकरी के अवसर खोजने के लिए कामखोज से जुड़ें",
      roleLabel: "आप कौन हैं?",
      roleSeeker: "नौकरी खोजने वाला",
      roleGiver: "नौकरी देने वाला",
      phone: "फोन नंबर",
      enterPhone: "10 अंकों का फोन नंबर दर्ज करें",
      email: "ईमेल (वैकल्पिक)",
      enterEmail: "अपना ईमेल दर्ज करें (वैकल्पिक)",
      pin: "PIN",
      createPin: "4 अंकों का PIN बनाएँ",
      confirmPin: "PIN की पुष्टि करें",
      confirmYourPin: "अपने PIN की पुष्टि करें",
      agreeTerms: "मैं नियम और शर्तों और गोपनीयता नीति से सहमत हूँ",
      termsAndConditions: "नियम और शर्तें",
      privacyPolicy: "गोपनीयता नीति",
      signUp: "साइन अप",
      creatingAccount: "खाता बनाया जा रहा है...",
      alreadyHaveAccount: "पहले से ही खाता है?",
      login: "लॉग इन",
      phoneRequired: "फोन नंबर आवश्यक है",
      phoneInvalid: "कृपया सही 10 अंकों का फोन नंबर डालें",
      invalidEmail: "ईमेल पता अमान्य है",
      pinRequired: "PIN आवश्यक है",
      pinLength: "PIN कम से कम 4 अंकों का होना चाहिए",
      pinsDoNotMatch: "PIN मेल नहीं खाते",
      mustAgreeTerms: "आपको नियम और शर्तों से सहमत होना चाहिए"
    },
    mr: {
      createAccount: "खाते तयार करा",
      joinKaamkhoj: "योग्य नोकरी शोधण्यासाठी KaamKhoj मध्ये सामील व्हा",
      roleLabel: "आपण कोण आहात?",
      roleSeeker: "नोकरी शोधणारा",
      roleGiver: "नोकरी देणारा",
      phone: "फोन नंबर",
      enterPhone: "10 अंकी फोन नंबर भरा",
      email: "ईमेल (ऐच्छिक)",
      enterEmail: "आपला ईमेल भरा (ऐच्छिक)",
      pin: "PIN",
      createPin: "4 अंकी PIN तयार करा",
      confirmPin: "PIN ची पुष्टी करा",
      confirmYourPin: "आपला PIN पुष्टी करा",
      agreeTerms: "मी अटी व शर्ती आणि गोपनीयता धोरणास सहमत आहे",
      termsAndConditions: "अटी व शर्ती",
      privacyPolicy: "गोपनीयता धोरण",
      signUp: "साइन अप",
      creatingAccount: "खाते तयार होत आहे...",
      alreadyHaveAccount: "आधीच खाते आहे?",
      login: "लॉगिन",
      phoneRequired: "फोन नंबर आवश्यक आहे",
      phoneInvalid: "कृपया योग्य 10 अंकी फोन नंबर टाका",
      invalidEmail: "ईमेल पत्ता अवैध आहे",
      pinRequired: "PIN आवश्यक आहे",
      pinLength: "PIN किमान 4 अंकांचा असावा",
      pinsDoNotMatch: "PIN जुळत नाहीत",
      mustAgreeTerms: "आपण अटी व शर्ती मान्य करणे आवश्यक आहे"
    },
    en: {
      createAccount: "Create Account",
      joinKaamkhoj: "Join KaamKhoj to find the perfect job opportunity",
      roleLabel: "I am a",
      roleSeeker: "Job seeker",
      roleGiver: "Job giver",
      phone: "Phone Number",
      enterPhone: "Enter 10-digit phone number",
      email: "Email (optional)",
      enterEmail: "Enter your email (optional)",
      pin: "PIN",
      createPin: "Create a 4-digit PIN",
      confirmPin: "Confirm PIN",
      confirmYourPin: "Confirm your PIN",
      agreeTerms: "I agree to the Terms and Conditions and Privacy Policy",
      termsAndConditions: "Terms and Conditions",
      privacyPolicy: "Privacy Policy",
      signUp: "Sign Up",
      creatingAccount: "Creating Account...",
      alreadyHaveAccount: "Already have an account?",
      login: "Login",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Please enter a valid 10-digit phone number",
      invalidEmail: "Email address is invalid",
      pinRequired: "PIN is required",
      pinLength: "PIN must be at least 4 digits",
      pinsDoNotMatch: "PINs do not match",
      mustAgreeTerms: "You must agree to the terms and conditions"
    }
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

    const digits = (formData.phone || "").replace(/\D/g, "");
    const normalized = digits.length > 10 ? digits.slice(-10) : digits;
    if (!normalized) {
      newErrors.phone = content[language].phoneRequired;
    } else if (normalized.length !== 10) {
      newErrors.phone = content[language].phoneInvalid;
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = content[language].invalidEmail;
    }
    
    if (!formData.password) {
      newErrors.password = content[language].pinRequired;
    } else if (formData.password.length < 4) {
      newErrors.password = content[language].pinLength;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = content[language].pinsDoNotMatch;
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = content[language].mustAgreeTerms;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Use the register function from our custom hook
    register({
      phone: formData.phone,
      email: formData.email || undefined,
      password: formData.password,
      role: formData.role,
    });
  };

  return (
    <>
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
      <div className="signup-container">
        <div className="signup-overlay"></div>
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">{content[language].createAccount}</h1>
            <p className="signup-subtitle">{content[language].joinKaamkhoj}</p>
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
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                {content[language].roleLabel}
              </label>
              <select
                name="role"
                id="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="seeker">{content[language].roleSeeker}</option>
                <option value="giver">{content[language].roleGiver}</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {content[language].pin}
              </label>
              <input
                name="password"
                id="password"
                type="password"
                placeholder={content[language].createPin}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            
            {/* <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                {content[language].confirmPassword}
              </label>
              <input
                name="confirmPassword"
                id="confirmPassword"
                type="password"
                placeholder={content[language].confirmYourPassword}
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div> */}
            
            <div className={`terms-checkbox ${errors.agreeTerms ? "is-invalid" : ""}`}>
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeTerms" className="terms-text">
                {content[language].agreeTerms.split('Terms and Conditions')[0]}
                <Link to="/terms" className="terms-link">{content[language].termsAndConditions}</Link>
                {' '}{language === 'hi' ? 'और' : language === 'mr' ? 'आणि' : 'and'}{' '}
                <Link to="/privacy" className="terms-link">{content[language].privacyPolicy}</Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <span className="error-message">{errors.agreeTerms}</span>
            )}
            
            <button 
              type="submit" 
              className="btn-signup"
              disabled={isLoading}
            >
              {isLoading ? content[language].creatingAccount : content[language].signUp}
            </button>
          </form>
          
          <div className="login-link-container">
            <span className="login-text">
              {content[language].alreadyHaveAccount} <Link to="/login" className="login-link">{content[language].login}</Link>
            </span>
          </div>
        </div>
      </div>
      <Footer language={language} />
    </>
  );
}
