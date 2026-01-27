import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AiAssistant.css";

const AiAssistant = ({ preview = false }) => {
  const { t } = useTranslation();

  return (
    <section className="ai-assistant-preview">
      <div className="container">
        <div className="ai-preview-content">
          <div className="ai-preview-text">
            <h2>{t("aiPreview.title")}</h2>
            <p>{t("aiPreview.description")}</p>
            <Link to="/assistant">
              <button className="ai-start-btn">
                <i className="fas fa-microphone me-2"></i>
                {t("aiPreview.button")}
              </button>
            </Link>
          </div>
          <div className="ai-preview-image">
            <div className="ai-chat-interface">
              <div className="ai-chat-header">
                <div className="ai-avatar">{t("aiPreview.avatarLabel")}</div>
                <div className="ai-name">
                  {t("aiPreview.assistantName")}
                </div>
              </div>
              <div className="ai-chat-messages">
                <div className="ai-message">{t("aiPreview.greeting")}</div>
                <div className="ai-message">{t("aiPreview.askName")}</div>
                <div className="user-message">{t("aiPreview.userNameExample")}</div>
                <div className="ai-message">{t("aiPreview.askMobile")}</div>
              </div>
              <div className="ai-chat-input">
                <div className="mic-button">
                  <i className="fas fa-microphone"></i>
                </div>
                <span className="input-placeholder">
                  {t("aiPreview.micPlaceholder")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistant;
