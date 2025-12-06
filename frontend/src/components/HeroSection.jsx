import React from "react";
import { useTranslation } from "react-i18next";
import "./HeroSection.css";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">{t("hero.title")}</h1>
          <p className="hero-subtitle">{t("hero.subtitle")}</p>

          <div className="popular-searches">
            <span>{t("hero.popularSearches")}: </span>
            <div className="popular-tags">
              {t("hero.popularTags", { returnObjects: true }).map((tag, index) => (
                <a href="#" className="tag" key={index}>
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
