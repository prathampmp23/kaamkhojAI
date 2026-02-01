import React from "react";
import { useTranslation } from "react-i18next";
import { Zap, Heart } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="kaamkhoj-footer">
      <div className="footer-container">
        {/* Brand Side */}
        <div className="footer-brand-side">
          <div className="footer-logo">
            <Zap size={20} fill="#2563eb" color="#2563eb" />
            <span>Kaam<span className="accent">Khoj</span>AI</span>
          </div>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} {t("footer.companyName", "KaamKhoj AI")}. 
            <br />
            {t("footer.rights", "All rights reserved.")}
          </p>
        </div>

        {/* Co-Founders Side */}
        <div className="footer-founders-side">
          <h4 className="founders-label">{t("footer.coFounders", "Co-Founders")}</h4>
          <div className="founders-list">
            <span>Manthan</span>
            <span>Pratham</span>
            <span>Rishabh</span>
            <span>Yachin</span>
            <span>Aashish</span>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;