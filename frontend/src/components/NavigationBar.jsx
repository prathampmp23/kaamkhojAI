import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./NavigationBar.css";
import { useAuthContext } from "../context/AuthContext";

const NavigationBar = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isAuthenticated, setIsAuthenticated, setCurrentUser } = useAuthContext();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Detect mobile viewport for conditional modal menu
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 992);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when mobile modal is open
  useEffect(() => {
    if (isMobile && menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, menuOpen]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Close language dropdown when toggling menu
    if (langDropdownOpen) setLangDropdownOpen(false);
  };

  // Toggle language dropdown
  const toggleLangDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLangDropdownOpen(!langDropdownOpen);
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    // persist preference so pages picking from localStorage stay in sync
    try {
      localStorage.setItem('preferredLanguage', lang);
    } catch {}
    // notify parent pages if they maintain local language state
    if (typeof onLanguageChange === 'function') {
      onLanguageChange(lang);
    }
    setLangDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (langDropdownOpen) setLangDropdownOpen(false);
      if (profileDropdownOpen) setProfileDropdownOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [langDropdownOpen, profileDropdownOpen]);
  
  // FIXED: Handle logout - Clear ALL user-related data
  const handleLogout = () => {
    // Remove authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    // CRITICAL FIX: Remove profile data to prevent showing wrong user's data
    localStorage.removeItem('workerProfile');
    
    // ADDITIONAL: Clear any other cached data
    localStorage.removeItem('preferredLanguage'); // Optional - remove if you want to keep language preference
    
    // Update context
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Navigate to home page
    navigate('/');
    
    // Optional: Force page reload to clear any lingering state
    window.location.reload();
  };
  
  // Toggle profile dropdown
  const toggleProfileDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            {t('brandName')}
          </Link>

          <button
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`navbar-menu ${menuOpen ? "active" : ""}`}>
            <ul className="nav-links">
              <li>
                <Link to="/" className="nav-link">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="nav-link">
                  {t('jobsLabel')}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="nav-link">
                  {t('assistant')}
                </Link>
              </li>
              <li className="language-dropdown-container">
                <button
                  className="nav-link language-toggle"
                  onClick={toggleLangDropdown}
                  aria-label="Select language"
                >
                  {t('language')}{" "}
                  <i
                    className={`fas fa-chevron-${
                      langDropdownOpen ? "up" : "down"
                    } ml-1`}
                  ></i>
                </button>
                <div
                  className={`language-dropdown ${
                    langDropdownOpen ? "show" : ""
                  }`}
                >
                  <button
                    className={`language-option ${
                      i18n.language === "hi" ? "active" : ""
                    }`}
                    onClick={() => handleLanguageChange("hi")}
                  >
                    हिंदी
                  </button>
                  <button
                    className={`language-option ${
                      i18n.language === "en" ? "active" : ""
                    }`}
                    onClick={() => handleLanguageChange("en")}
                  >
                    English
                  </button>
                   <button
                    className={`language-option ${
                      i18n.language === "mr" ? "active" : ""
                    }`}
                    onClick={() => handleLanguageChange("mr")}
                  >
                    मराठी
                  </button>
                </div>
              </li>
            </ul>

            <div className="auth-buttons">
              {isAuthenticated ? (
                // Show profile dropdown when logged in
                <div className="profile-dropdown-container">
                  <button
                    className="signup-btn profile-toggle"
                    onClick={toggleProfileDropdown}
                    aria-label="Profile options"
                  >
                    {t('user')}{" "}
                    <i
                      className={`fas fa-chevron-${
                        profileDropdownOpen ? "up" : "down"
                      } ml-1`}
                    ></i>
                  </button>
                  <div
                    className={`profile-dropdown ${
                      profileDropdownOpen ? "show" : ""
                    }`}
                  >
                    <Link to="/profile" className="dropdown-item">
                       {t('profile')}
                    </Link>
                    <Link to="/dashboard" className="dropdown-item">
                       {t('dashboard')}
                    </Link>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> {t('logout')}
                    </button>
                  </div>
                </div>
              ) : (
                // Show login and signup buttons when not logged in
                <>
                  <Link to="/login" className="login-btn">
                    {t('login')}
                  </Link>
                  <Link to="/signup" className="signup-btn">
                    {t('signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Modal Menu via Portal (ensures full-viewport coverage) */}
      {isMobile && menuOpen && createPortal(
        (
          <div className="mobile-modal-overlay" onClick={toggleMenu}>
            <div className="mobile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-modal-header">
                <span className="mobile-modal-title">{t('brandName')}</span>
                <button className="mobile-modal-close" aria-label="Close menu" onClick={toggleMenu}>×</button>
              </div>
              <div className="mobile-modal-body">
                <Link to="/" className="mobile-modal-link" onClick={toggleMenu}>{t('home')}</Link>
                <Link to="/jobs" className="mobile-modal-link" onClick={toggleMenu}>{t('jobsLabel')}</Link>
                <Link to="/assistant" className="mobile-modal-link" onClick={toggleMenu}>{t('assistant')}</Link>
                <div className="mobile-modal-section">
                  <div className="mobile-modal-section-title">{t('language')}</div>
                  <div className="mobile-language-buttons">
                    <button className={`mobile-lang-btn ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => {handleLanguageChange('en');}}>
                      English
                    </button>
                    <button className={`mobile-lang-btn ${i18n.language === 'hi' ? 'active' : ''}`} onClick={() => {handleLanguageChange('hi');}}>
                      हिंदी
                    </button>
                    <button className={`mobile-lang-btn ${i18n.language === 'mr' ? 'active' : ''}`} onClick={() => {handleLanguageChange('mr');}}>
                      मराठी
                    </button>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="mobile-modal-section">
                    <div className="mobile-modal-section-title">{t('user')}</div>
                    <Link to="/profile" className="mobile-modal-link" onClick={toggleMenu}>{t('profile')}</Link>
                    <Link to="/dashboard" className="mobile-modal-link" onClick={toggleMenu}>{t('dashboard')}</Link>
                    <button className="mobile-modal-link danger" onClick={() => {toggleMenu(); handleLogout();}}>
                      <i className="fas fa-sign-out-alt mr-2"></i>{t('logout')}
                    </button>
                  </div>
                ) : (
                  <div className="mobile-auth-row">
                    <Link to="/login" className="login-btn" onClick={toggleMenu}>{t('login')}</Link>
                    <Link to="/signup" className="signup-btn" onClick={toggleMenu}>{t('signup')}</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </nav>
  );
};

export default NavigationBar;