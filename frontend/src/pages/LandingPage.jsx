import React, { useState, useEffect } from "react";
import {
  Mic,
  Search,
  Phone,
  Globe,
  Volume2,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
  Play,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "./LandingPage.css";

// Internal Components
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import AiAsstance from "../components/AiAssistant";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loader-screen">
        <div className="loader-content">
          <div className="logo-icon animate-pulse">
            <Zap size={38} fill="#2563eb" color="#2563eb" />
          </div>
          <div className="">
            <h1 className="shimmer-text">{t("KaamKhojAI")}</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-wrapper">
      <NavigationBar />
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-orb"></div>
          <div className="hero-content">
            <div className="ai-tag">
              ✨ {t("hero.tagline", "100% Vernacular AI Matching")}
            </div>
            <h1 className="hereo-head-heading">
              {t("hero.heading.line1", "Sahi Kaam,")} <br />
              <span className="text-gradient">{t("hero.heading.line2", "Sahi Waqt Par.")}</span>
            </h1>
            <p className="hero-subtitle">
              {t(
                "hero.subtitle",
                "The first job platform built for Bharat. Just talk to our AI in your native language and get matched to jobs within 5km instantly.",
              )}
            </p>
            <div className="hero-actions">
              <Link to="/assistant" className="link">
                <button className="cta-primary">
                  {t("getStarted", "Get Started")} <ArrowRight size={20} />
                </button>
              </Link>
              <button className="cta-secondary">
                <Play size={18} fill="currentColor" />{" "}
                {t("watchDemo", "Watch Demo")}
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="bento-container" id="features">
          <h2 className="section-label">{t("capabilities", "Capabilities")}</h2>
          <h3 className="section-title-heading">
            {t("bento.title", "Built for the Next Billion")}
          </h3>

          <div className="bento-grid">
            {/* Feature Cards use t() for full localization */}
            <div className="bento-card large dark-card">
              <div className="card-icon">
                <Globe size={40} />
              </div>
              <h3>{t("features.vernacular.title", "Vernacular AI Search")}</h3>
              <p>
                {t(
                  "features.vernacular.desc",
                  "Speak or type in English, Hindi, or Marathi. Our AI understands every dialect.",
                )}
              </p>
              <div className="card-visual">
                <div className="lang-tag float-1">हिन्दी</div>
                <div className="lang-tag float-2">मराठी</div>
                <div className="lang-tag float-3">English</div>
                <div className="visual-glow"></div>
              </div>
            </div>

            <div className="bento-card medium glass-card">
              <div className="card-icon">
                <Mic size={35} />
              </div>
              <h3>{t("features.voice.title", "Voice Profiles")}</h3>
              <p>
                {t(
                  "features.voice.desc",
                  "No resume needed. Just tell us your experience.",
                )}
              </p>
            </div>

            <div className="bento-card small green-card">
              <div className="card-icon">
                <ShieldCheck size={35} />
              </div>
              <h3>{t("features.verified.title", "100% Verified")}</h3>
              <p>
                {t(
                  "features.verified.desc",
                  "Aadhaar verified employers only.",
                )}
              </p>
            </div>

            <div className="bento-card small accent-card ">
              <div className="card-icon">
                <MapPin size={35} />
              </div>
              <h3>{t("features.local.title", "Hyper-Local")}</h3>
              <p>{t("features.local.desc", "Work within 5km of home.")}</p>
            </div>
          </div>
        </section>
      </main>
      <AiAsstance />
      <Footer />
    </div>
  );
};

export default LandingPage;
