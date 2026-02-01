import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, User, Menu, X, ChevronDown, Zap, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import "./NavigationBar.css";

const NavigationBar = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const { isAuthenticated, setIsAuthenticated, setCurrentUser } = useAuthContext();
  const navigate = useNavigate();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setLangDropdownOpen(false);
      setProfileDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('preferredLanguage', lang);
    } catch {}
    if (onLanguageChange) onLanguageChange(lang);
    setLangDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('workerProfile');
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className={`modern-nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-container">
        {/* Left: Brand */}
        <Link to="/" className="nav-brand">
          <div className="nav-logo">
            <Zap size={20} fill="#2563eb" color="#2563eb" />{" "}
            <span>
              Kaam<span className="accent">Khoj</span>AI
            </span>
          </div>
        </Link>

        {/* Center: Desktop Links */}
        <div className="nav-desktop-links">
          <Link to="/" className={pathname === "/" ? "active" : ""}>{t("home")}</Link>
          <Link to="/jobs" className={pathname === "/jobs" ? "active" : ""}>{t("jobsLabel")}</Link>
          <Link to="/assistant" className={pathname === "/assistant" ? "active" : ""}>{t("assistant")}</Link>
        </div>

        {/* Right Actions */}
        <div className="nav-right-actions">
          {/* Language Toggle */}
          <div className="lang-dropdown-wrapper">
            <button
              className="lang-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(false);
                setLangDropdownOpen(!langDropdownOpen);
              }}
            >
              <Globe size={18} />
              <span className="lang-text-label">{i18n.language.toUpperCase()}</span>
              <ChevronDown size={14} className={langDropdownOpen ? "rotate" : ""} />
            </button>
            {langDropdownOpen && (
              <div className="absolute-dropdown shadow-lg">
                {["en", "hi", "mr"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={i18n.language === lang ? "active-opt" : ""}
                  >
                    {lang === "en" ? "English" : lang === "hi" ? "हिन्दी" : "मराठी"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Auth */}
          <div className="desktop-only profile-dropdown-wrapper">
            {!isAuthenticated ? (
              <Link to="/signup" className="btn-signup-modern">Join Now</Link>
            ) : (
              <>
                <button 
                  className="avatar-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLangDropdownOpen(false);
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                >
                  <User size={20} /> User
                </button>
                {profileDropdownOpen && (
                  <div className="absolute-dropdown profile-menu shadow-lg">
                    <Link to="/profile">
                      <UserCircle size={16} /> {t('profile')}
                    </Link>
                    <Link to="/dashboard">
                      <LayoutDashboard size={16} /> {t('dashboard')}
                    </Link>
                    <hr />
                    <button onClick={handleLogout} className="logout-btn">
                      <LogOut size={16} /> {t('logout')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Modal via Portal */}
      {menuOpen && createPortal(
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <span className="brand-title">KaamKhojAI</span>
              <button className="close-sheet-btn" onClick={() => setMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="sheet-body">
              <div className="sheet-links">
                <Link to="/" onClick={() => setMenuOpen(false)}>{t("home")}</Link>
                <Link to="/jobs" onClick={() => setMenuOpen(false)}>{t("jobsLabel")}</Link>
                <Link to="/assistant" onClick={() => setMenuOpen(false)}>{t("assistant")}</Link>
              </div>

              <div className="sheet-auth-footer">
                {!isAuthenticated ? (
                  <>
                    <Link to="/signup" className="mobile-btn-primary" onClick={() => setMenuOpen(false)}>Join Now</Link>
                    <Link to="/login" className="mobile-btn-outline" onClick={() => setMenuOpen(false)}>Login / Sign In</Link>
                  </>
                ) : (
                  <div className="mobile-user-menu">
                    <Link to="/profile" className="mobile-btn-primary" onClick={() => setMenuOpen(false)}>My Profile</Link>
                    <Link to="/dashboard" className="mobile-btn-outline" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    <button className="mobile-logout-btn" onClick={() => { setMenuOpen(false); handleLogout(); }}>
                      <LogOut size={18} /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default NavigationBar;