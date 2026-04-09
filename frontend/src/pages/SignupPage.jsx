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
    otp: "",
    role: "seeker",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [otpInfo, setOtpInfo] = useState("");
  const [language, setLanguage] = useState(i18n.language || "en");
  const { isLoading, error, register, sendEmailOtp, setError } = useAuth();

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
      email: "ईमेल",
      emailOptional: "ईमेल (वैकल्पिक)",
      enterEmail: "अपना ईमेल दर्ज करें",
      enterEmailOptional: "अपना ईमेल दर्ज करें (वैकल्पिक)",
      otp: "OTP",
      enterOtp: "6 अंकों का OTP दर्ज करें",
      sendOtp: "OTP भेजें",
      otpSent: "OTP आपके ईमेल पर भेजा गया है",
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
      emailRequiredForGiver: "नौकरी देने वाले के लिए ईमेल आवश्यक है",
      otpRequired: "OTP आवश्यक है",
      otpInvalid: "कृपया सही 6 अंकों का OTP डालें",
      pinRequired: "PIN आवश्यक है",
      pinLength: "PIN कम से कम 4 अंकों का होना चाहिए",
      pinsDoNotMatch: "PIN मेल नहीं खाते",
      mustAgreeTerms: "आपको नियम और शर्तों से सहमत होना चाहिए",
    },
    mr: {
      createAccount: "खाते तयार करा",
      joinKaamkhoj: "योग्य नोकरी शोधण्यासाठी KaamKhoj मध्ये सामील व्हा",
      roleLabel: "आपण कोण आहात?",
      roleSeeker: "नोकरी शोधणारा",
      roleGiver: "नोकरी देणारा",
      phone: "फोन नंबर",
      enterPhone: "10 अंकी फोन नंबर भरा",
      email: "ईमेल",
      emailOptional: "ईमेल (ऐच्छिक)",
      enterEmail: "आपला ईमेल भरा",
      enterEmailOptional: "आपला ईमेल भरा (ऐच्छिक)",
      otp: "OTP",
      enterOtp: "6 अंकी OTP भरा",
      sendOtp: "OTP पाठवा",
      otpSent: "OTP आपल्या ईमेलवर पाठवला आहे",
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
      emailRequiredForGiver: "नोकरी देणाऱ्यासाठी ईमेल आवश्यक आहे",
      otpRequired: "OTP आवश्यक आहे",
      otpInvalid: "कृपया योग्य 6 अंकी OTP टाका",
      pinRequired: "PIN आवश्यक आहे",
      pinLength: "PIN किमान 4 अंकांचा असावा",
      pinsDoNotMatch: "PIN जुळत नाहीत",
      mustAgreeTerms: "आपण अटी व शर्ती मान्य करणे आवश्यक आहे",
    },
    en: {
      createAccount: "Create Account",
      joinKaamkhoj: "Join KaamKhoj to find the perfect job opportunity",
      roleLabel: "I am a",
      roleSeeker: "Job seeker",
      roleGiver: "Job giver",
      phone: "Phone Number",
      enterPhone: "Enter 10-digit phone number",
      email: "Email",
      emailOptional: "Email (optional)",
      enterEmail: "Enter your email",
      enterEmailOptional: "Enter your email (optional)",
      otp: "OTP",
      enterOtp: "Enter 6-digit OTP",
      sendOtp: "Send OTP",
      otpSent: "OTP has been sent to your email",
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
      emailRequiredForGiver: "Email is required for job giver",
      otpRequired: "OTP is required",
      otpInvalid: "Please enter a valid 6-digit OTP",
      pinRequired: "PIN is required",
      pinLength: "PIN must be at least 4 digits",
      pinsDoNotMatch: "PINs do not match",
      mustAgreeTerms: "You must agree to the terms and conditions",
    },
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem("preferredLanguage", lang);
    } catch {}
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
    const isJobGiver = formData.role === "giver";

    const digits = (formData.phone || "").replace(/\D/g, "");
    const normalized = digits.length > 10 ? digits.slice(-10) : digits;
    if (!normalized) {
      newErrors.phone = content[language].phoneRequired;
    } else if (normalized.length !== 10) {
      newErrors.phone = content[language].phoneInvalid;
    }

    if (isJobGiver && !formData.email) {
      newErrors.email = content[language].emailRequiredForGiver;
    } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = content[language].invalidEmail;
    }

    if (isJobGiver) {
      const otp = String(formData.otp || "").trim();
      if (!otp) {
        newErrors.otp = content[language].otpRequired;
      } else if (!/^\d{6}$/.test(otp)) {
        newErrors.otp = content[language].otpInvalid;
      }
    } else {
      if (!formData.password) {
        newErrors.password = content[language].pinRequired;
      } else if (formData.password.length < 4) {
        newErrors.password = content[language].pinLength;
      }
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = content[language].mustAgreeTerms;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    const email = String(formData.email || "").trim();
    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: content[language].emailRequiredForGiver,
      }));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: content[language].invalidEmail,
      }));
      return;
    }

    const result = await sendEmailOtp({ email, purpose: "signup" });
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

    // Use the register function from our custom hook
    register({
      phone: formData.phone,
      email:
        formData.role === "giver" ? formData.email || undefined : undefined,
      password: formData.role === "seeker" ? formData.password : undefined,
      otp: formData.role === "giver" ? formData.otp : undefined,
      role: formData.role,
    });
  };

  return (
    <>
      <NavigationBar
        language={language}
        onLanguageChange={handleLanguageChange}
      />
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
              <label className="form-label">
                {content[language].roleLabel}
              </label>
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
              <input type="hidden" name="role" value={formData.role} />
            </div>

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

            {formData.role === "giver" && (
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
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
            )}

            {formData.role === "seeker" ? (
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
            ) : (
              <>
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
            )}

            <div
              className={`terms-checkbox ${errors.agreeTerms ? "is-invalid" : ""}`}
            >
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeTerms" className="terms-text">
                {content[language].agreeTerms.split("Terms and Conditions")[0]}
                <Link to="/terms" className="terms-link">
                  {content[language].termsAndConditions}
                </Link>{" "}
                {language === "hi" ? "और" : language === "mr" ? "आणि" : "and"}{" "}
                <Link to="/privacy" className="terms-link">
                  {content[language].privacyPolicy}
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <span className="error-message">{errors.agreeTerms}</span>
            )}

            <button type="submit" className="btn-signup" disabled={isLoading}>
              {isLoading
                ? content[language].creatingAccount
                : content[language].signUp}
            </button>
          </form>

          <div className="login-link-container">
            <span className="login-text">
              {content[language].alreadyHaveAccount}{" "}
              <Link to="/login" className="login-link">
                {content[language].login}
              </Link>
            </span>
          </div>
        </div>
      </div>
      <Footer language={language} />
    </>
  );
}
