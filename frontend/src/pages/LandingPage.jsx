import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavigationBar from "../components/NavigationBar";
import HeroSection from "../components/HeroSection";
import JobListings from "../components/JobListings";
import AiAssistant from "../components/AiAssistant";
import Footer from "../components/Footer";
import "./LandingPage.css";

const LandingPage = () => {
  const { t } = useTranslation();
  const features = t("features.list", { returnObjects: true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page">
      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <h2 className="brand-name">KaamKhoojAI</h2>
          <p className="brand-tagline">A New Path to Employment</p>
        </div>
      ) : (
        <>
          <NavigationBar />

          <main>
            <HeroSection />

            <section className="features-section">
              <div className="container">
                <h2 className="section-title">{t("features.title")}</h2>
                <div className="features-grid">
                  {Array.isArray(features) ? (
                    features.map((feature, index) => (
                      <div className="feature" key={index}>
                        <div className="feature-icon">
                          <i
                            className={`fas fa-${
                              [
                                "language",
                                "volume-up",
                                "map-marker-alt",
                                "user-shield",
                              ][index]
                            }`}
                          ></i>
                        </div>

                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    ))
                  ) : (
                    <p>Loading features...</p>
                  )}
                </div>
              </div>
            </section>

            <section className="quick-actions">
              <h2 className="quick-action-title">{t("quickActions.title")}</h2>
              <div className="container">
                <div className="action-card ">
                  <div className="action-icon">
                    <i className="fas fa-microphone"></i>
                  </div>
                  <h3>{t("quickActions.voiceForm.title")}</h3>
                  <p>{t("quickActions.voiceForm.description")}</p>
                  <Link to="/assistant" className="action-btn">
                    {t("quickActions.voiceForm.button")}
                  </Link>
                </div>

                <div className="action-card highlight">
                  <div className="action-icon">
                    <i className="fas fa-search-location"></i>
                  </div>
                  <h3>{t("quickActions.findJob.title")}</h3>
                  <p>{t("quickActions.findJob.description")}</p>
                  <Link to="/jobs" className="action-btn">
                    {t("quickActions.findJob.button")}
                  </Link>
                </div>

                <div className="action-card">
                  <div className="action-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <h3>{t("quickActions.contact.title")}</h3>
                  <p>{t("quickActions.contact.description")}</p>
                  <Link to="/" className="action-btn">
                    {t("quickActions.contact.button")}
                  </Link>
                </div>
              </div>
            </section>

            <AiAssistant />

            <JobListings title={t("jobListings")} showCount={4} />
          </main>

          <Footer />
        </>
      )}
    </div>
  );
};

export default LandingPage;
