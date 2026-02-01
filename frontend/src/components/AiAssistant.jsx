import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mic, Send, Sparkles } from "lucide-react";
import "./AiAssistant.css";

const AiAssistant = ({ preview = false }) => {
  const { t } = useTranslation();

  return (
    <section className="ai-modern-section">
      <div className="glow-orb"></div>
      <div className="container">
        <div className="modern-layout">
          <div className="content-side">
            <span className="badges">
              <Sparkles size={14} fill="black"/>
              {"  "}
              {"AI Powered"}
            </span>
            <h1>{t("aiPreview.title")}</h1>
            <p>{t("aiPreview.description")}</p>
            <Link to="/assistant" className="btn-wrapper">
              <button className="modern-btn">
                {t("aiPreview.button")}
                <div className="btn-icon">
                  <Mic size={18} />
                </div>
              </button>
            </Link>
          </div>

          <div className="visual-side">
            <div className="glass-chat">
              <div className="chat-header">
                <div className="avatar-stack">
                  <div className="avatar-main">AI</div>
                  <div className="status-dot"></div>
                </div>
                <div className="header-info">
                  <span className="name">{t("aiPreview.assistantName")}</span>
                  <span className="status">{"Always active"}</span>
                </div>
              </div>

              <div className="chat-body">
                <div className="bubble ai-bubble">
                  {t("aiPreview.greeting")}
                </div>
                <div className="bubble user-bubble">
                  {t("aiPreview.userNameExample")}
                </div>
                <div className="bubble ai-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <div className="chat-footer">
                <div className="input-pill">
                  <span>{t("aiPreview.micPlaceholder")}</span>
                  <button className="send-btn">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistant;
