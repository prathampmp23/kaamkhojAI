import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./AiAssistantPage.css";
import { X, Mic } from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import axios from "axios";
import server from "../environment";

const flowOrder = [
  "name",
  "age",
  "address",
  "phone",
  "shift_time",
  "experience",
  "job_title",
  "salary_expectation",
];

const getFieldPrompt = (field, lang) => {
  const prompts = {
    name: {
      en: "First, please tell me your name. Click the mic and speak your full name.",
      hi: "सबसे पहले अपना नाम बताइए। माइक्रोफोन पर क्लिक करें और अपना पूरा नाम बोलिए।",
      mr: "सर्वप्रथम तुमचे नाव सांगा. माईकवर क्लिक करा आणि तुमचे पूर्ण नाव बोला.",
    },
    age: {
      en: "Thank you. Now tell your age in years.",
      hi: "धन्यवाद। अब अपनी उम्र सालों में बताइए।",
      mr: "धन्यवाद. आता तुमचे वय वर्षांत सांगा.",
    },
    address: {
      en: "Please tell your address or area.",
      hi: "कृपया अपना पता या इलाका बताइए।",
      mr: "कृपया तुमचा पत्ता किंवा परिसर सांगा.",
    },
    phone: {
      en: "Please tell your 10-digit phone number.",
      hi: "कृपया अपना 10 अंकों का फोन नंबर बताइए।",
      mr: "कृपया तुमचा 10 अंकी फोन नंबर सांगा.",
    },
    shift_time: {
      en: "Preferred shift: day, night, or flexible?",
      hi: "पसंदीदा शिफ्ट: दिन, रात, या लचीला?",
      mr: "आवडती शिफ्ट: दिवस, रात्र, की लवचिक?",
    },
    experience: {
      en: "How many years of experience do you have?",
      hi: "आपके पास कितने साल का अनुभव है?",
      mr: "तुमच्याकडे किती वर्षांचा अनुभव आहे?",
    },
    job_title: {
      en: "Which job type are you looking for (e.g., driver, cook, security)?",
      hi: "आप किस प्रकार की नौकरी ढूँढ़ रहे हैं (जैसे, ड्राइवर, कुक, सिक्योरिटी)?",
      mr: "तुम्ही कोणत्या प्रकारची नोकरी शोधत आहात (उदा., ड्रायव्हर, कुक, सिक्युरिटी)?",
    },
    salary_expectation: {
      en: "What monthly salary do you expect?",
      hi: "आप कितनी मासिक तनख्वाह की उम्मीद करते हैं?",
      mr: "तुम्ही मासिक किती पगार अपेक्षित करता?",
    },
  };

  const langKey = lang === "hi" ? "hi" : lang === "mr" ? "mr" : "en";
  return prompts[field]?.[langKey] || "";
};

const getRetryPrompt = (field, lang) => {
  const prompts = {
    name: {
      en: "I didn't catch that clearly. Please say your full name again.",
      hi: "मुझे ठीक से समझ नहीं आया। कृपया अपना पूरा नाम फिर से बताइए।",
      mr: "मला ते नीट कळले नाही. कृपया तुमचे पूर्ण नाव पुन्हा सांगा.",
    },
    age: {
      en: "Please say your age in years clearly (for example: twenty three).",
      hi: "कृपया अपनी उम्र साफ़ बताइए (जैसे: तेईस)।",
      mr: "कृपया तुमचे वय स्पष्ट सांगा (उदा.: तेवीस).",
    },
    address: {
      en: "Please say your address or nearby area again.",
      hi: "कृपया अपना पता फिर से बताइए।",
      mr: "कृपया तुमचा पत्ता पुन्हा सांगा.",
    },
    phone: {
      en: "Please say your 10-digit phone number slowly, one digit at a time.",
      hi: "कृपया अपना 10 अंकों का नंबर धीरे-धीरे, एक-एक अंक बोलिए।",
      mr: "कृपया तुमचा 10 अंकी नंबर हळू, एक-एक अंक सांगा.",
    },
    shift_time: {
      en: "Say day, night, or flexible.",
      hi: "दिन, रात, या लचीला बोलिए।",
      mr: "दिवस, रात्र, किंवा लवचिक बोला.",
    },
    experience: {
      en: "Say how many years of experience you have.",
      hi: "बताइए कितने साल का अनुभव है।",
      mr: "किती वर्षांचा अनुभव आहे ते सांगा.",
    },
    job_title: {
      en: "Say your desired job type again.",
      hi: "अपनी नौकरी का प्रकार फिर से बोलिए।",
      mr: "तुमची नोकरीचा प्रकार पुन्हा सांगा.",
    },
    salary_expectation: {
      en: "What monthly salary do you expect? Please say it clearly.",
      hi: "मासिक तनख्वाह कितनी चाहिए? साफ़ बोलें।",
      mr: "मासिक पगार किती हवा? स्पष्ट बोला.",
    },
  };

  const langKey = lang === "hi" ? "hi" : lang === "mr" ? "mr" : "en";
  return prompts[field]?.[langKey] || "";
};

const AiAssistantPage = () => {
  const navigate = useNavigate();
  const server_url = `${server}`;

  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    try {
      i18n.changeLanguage(lang);
      localStorage.setItem("preferredLanguage", lang);
    } catch {}
  };

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    address: "",
    phone: "",
    shift_time: "",
    experience: "",
    job_title: "",
    salary_expectation: "",
  });
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const currentFieldIndexRef = useRef(0);
  const [retryCounts, setRetryCounts] = useState({});
  const recognitionRef = useRef(null);
  const [userName] = useState("User");
  const processingLockRef = useRef(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const isActiveRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition on unmount:", e);
        }
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.error("Error cancelling speechSynthesis on unmount:", e);
        }
      }
    };
  }, []);

  // Ensure browser voices are loaded
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const handleVoicesChanged = () => {
      const list = window.speechSynthesis.getVoices();
      setVoicesLoaded(Array.isArray(list) && list.length > 0);
    };
    handleVoicesChanged();
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text, lang, onend) => {
    if (!window.speechSynthesis || !text || !isActiveRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const requested =
      lang === "en"
        ? "en-IN"
        : lang === "hi"
          ? "hi-IN"
          : lang === "mr"
            ? "mr-IN"
            : lang;

    const voices = window.speechSynthesis.getVoices();
    const lower = (s) => (s || "").toLowerCase();
    const findExact = voices.find((v) => lower(v.lang) === lower(requested));
    const base = lower(requested).split("-")[0];
    const findBase = voices.find((v) => lower(v.lang).startsWith(base));
    const findHindi = voices.find((v) => lower(v.lang).startsWith("hi"));
    const findEnIn = voices.find((v) => lower(v.lang).startsWith("en-in"));
    const findEn = voices.find((v) => lower(v.lang).startsWith("en"));

    let chosen = findExact || findBase;
    if (!chosen && base === "mr") {
      chosen = findHindi || findEnIn || findEn;
    }
    if (!chosen) {
      chosen = findEnIn || findEn || null;
    }

    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang || requested;
    } else {
      utterance.lang = requested === "mr-IN" ? "hi-IN" : requested;
    }

    const wrappedOnEnd = () => {
      if (!isActiveRef.current) return;
      onend && onend();
    };
    if (onend) utterance.onend = wrappedOnEnd;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const getCurrentField = () => flowOrder[currentFieldIndexRef.current];

  const goToNextField = () => {
    const nextIndex = Math.min(
      currentFieldIndexRef.current + 1,
      flowOrder.length - 1,
    );
    currentFieldIndexRef.current = nextIndex;
    setCurrentFieldIndex(nextIndex);
  };

  useEffect(() => {
    currentFieldIndexRef.current = 0;
    setCurrentFieldIndex(0);

    const welcomeMessage = t("welcomeMessage", { userName });
    const prompt = t("prompt");

    setMessages([{ sender: "ai", text: welcomeMessage, prompt }]);
    speak(`${welcomeMessage} ${prompt}`, i18n.language);

    if ("webkitSpeechRecognition" in window) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        i18n.language === "en"
          ? "en-US"
          : i18n.language === "hi"
            ? "hi-IN"
            : "mr-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        setTranscript("");
      };

      recognition.onresult = (event) => {
        const finalTranscript = event.results[0][0].transcript.trim();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        handleTranscript(finalTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      alert(t("speechRecognitionNotSupported"));
    }
  }, [userName, i18n.language, t]);

  const handleTranscript = async (text) => {
    if (!text || processingLockRef.current) return;
    processingLockRef.current = true;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    const field = getCurrentField();
    const lang = i18n.language;

    try {
      // Call backend AI validation endpoint
      const res = await axios.post(`${server_url}/api/voice/validate-with-ai`, {
        text,
        fieldType: field,
        language: lang,
      });

      const { success, extractedValue, confidence } = res.data;
      let value = extractedValue;

      console.log("AI Validation:", { field, success, value, confidence });

      if (success && value !== null && value !== "") {
        // Valid value captured
        setFormData((prev) => {
          const updated = { ...prev, [field]: value };
          console.log("Captured field:", field, "=", value);
          return updated;
        });

        setRetryCounts((prev) => ({ ...prev, [field]: 0 }));

        if (currentFieldIndexRef.current + 1 < flowOrder.length) {
          // Move to next field
          goToNextField();
          const nextField = getCurrentField();
          const promptText = getFieldPrompt(nextField, lang);
          if (promptText) {
            speak(promptText, lang);
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: promptText, prompt: "" },
            ]);
          }
        } else {
          // All fields filled - submit profile
          try {
            const finalData = {
              ...formDataRef.current,
              [field]: value,
            };

            console.log("Submitting finalData:", finalData);

            const token = localStorage.getItem("token");

            const profileRes = await axios.post(
              `${server_url}/api/auth/create-profile`,
              finalData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const {
              profileId,
              user: createdProfile,
              recommendedJobs,
            } = profileRes.data;

            localStorage.setItem(
              "workerProfile",
              JSON.stringify({
                profileId,
                name: createdProfile.name,
                age: createdProfile.age,
                address: createdProfile.address,
                phone: createdProfile.phone,
                shift_time: createdProfile.shift_time,
                experience: createdProfile.experience,
                job_title: createdProfile.job_title,
                salary_expectation: createdProfile.salary_expectation,
              }),
            );

            let jobRecommendationSpeech = "";

            if (recommendedJobs && recommendedJobs.length > 0) {
              jobRecommendationSpeech = t("jobRecommendationIntro");
              recommendedJobs.forEach((job) => {
                jobRecommendationSpeech += t("jobDetails", {
                  title: job.jobName || job.title || "",
                  company: job.company || "",
                  salary: job.salary || "",
                });
              });
            } else {
              jobRecommendationSpeech = t("noJobsFoundMessage");
            }

            speak(jobRecommendationSpeech, lang);
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: jobRecommendationSpeech, prompt: "" },
            ]);

            setTimeout(() => {
              navigate("/jobs", {
                state: {
                  fromProfile: true,
                  profileId,
                  recommendedJobs: recommendedJobs || [],
                },
              });
            }, 800);
          } catch (e) {
            console.error("Profile submission error:", e);
            if (e.response) {
              console.log("Server said:", e.response.data);
            }
            speak(t("profileError"), lang);
          }
        }
      } else {
        // Validation failed - retry logic
        setRetryCounts((prev) => {
          const count = (prev[field] || 0) + 1;
          const nextCounts = { ...prev, [field]: count };
          const retryPrompt = getRetryPrompt(field, lang);

          if (count >= 2 && text.trim()) {
            // After 2 retries, accept the input as-is
            console.log("Max retries reached, accepting input:", text.trim());
            setFormData((prevForm) => ({
              ...prevForm,
              [field]: text.trim(),
            }));

            if (currentFieldIndexRef.current + 1 < flowOrder.length) {
              goToNextField();
              const nextField = getCurrentField();
              const promptText = getFieldPrompt(nextField, lang);
              if (promptText) {
                speak(promptText, lang);
                setMessages((prevMsgs) => [
                  ...prevMsgs,
                  { sender: "ai", text: promptText, prompt: "" },
                ]);
              }
            }
          } else {
            // Ask to retry
            speak(retryPrompt, lang);
            setMessages((prevMsgs) => [
              ...prevMsgs,
              { sender: "ai", text: retryPrompt, prompt: "" },
            ]);
          }

          return nextCounts;
        });
      }
    } catch (error) {
      console.error("Error processing text:", error);

      // If AI validation fails, try to accept the input anyway after 1 retry
      setRetryCounts((prev) => {
        const count = (prev[field] || 0) + 1;
        const nextCounts = { ...prev, [field]: count };

        if (count >= 1 && text.trim()) {
          console.log("API error, accepting input:", text.trim());
          setFormData((prevForm) => ({
            ...prevForm,
            [field]: text.trim(),
          }));

          if (currentFieldIndexRef.current + 1 < flowOrder.length) {
            goToNextField();
            const nextField = getCurrentField();
            const promptText = getFieldPrompt(nextField, lang);
            if (promptText) {
              speak(promptText, lang);
              setMessages((prev) => [
                ...prev,
                { sender: "ai", text: promptText, prompt: "" },
              ]);
            }
          }
        } else {
          const errorMessage =
            t("connectionError") || "Connection error. Please try again.";
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: errorMessage, prompt: "" },
          ]);
          speak(errorMessage, i18n.language);
        }

        return nextCounts;
      });
    } finally {
      processingLockRef.current = false;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const cancelListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const lastAiMessage = messages
    .slice()
    .reverse()
    .find((m) => m.sender === "ai");

  return (
    <>
      <NavigationBar />
      <div className="ai-assistant-page">
        <div className="ai-assistant-container">
          <div className="ai-lang-bar">
            <span className="ai-lang-title">{t("language")}</span>
            <div className="ai-lang-buttons">
              <button
                className={`ai-lang-btn ${i18n.language === "en" ? "active" : ""}`}
                onClick={() => changeLanguage("en")}
              >
                English
              </button>
              <button
                className={`ai-lang-btn ${i18n.language === "hi" ? "active" : ""}`}
                onClick={() => changeLanguage("hi")}
              >
                हिंदी
              </button>
              <button
                className={`ai-lang-btn ${i18n.language === "mr" ? "active" : ""}`}
                onClick={() => changeLanguage("mr")}
              >
                मराठी
              </button>
            </div>
          </div>
          <div className="window-header"></div>
          <div className={`sphere ${isListening ? "listening" : ""}`}>
            <video
              className="voice-orb"
              src="/original-1b477c07d12be3192b67e5ed8aa6da03.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>

          <div className="listening-text">
            {isListening
              ? t("listening")
              : lastAiMessage
                ? lastAiMessage.text
                : t("clickToTalk")}
          </div>

          <div className="prompt-text">
            {isListening
              ? transcript
              : lastAiMessage
                ? lastAiMessage.prompt
                : ""}
          </div>

          <div className="controls">
            <button className="control-button" onClick={cancelListening}>
              <X />
            </button>
            <button
              className="control-button mic-btn"
              onClick={toggleListening}
            >
              <Mic />
            </button>
          </div>

          {/* Captured Fields info */}
          <div className="side-section">
            {formData.name && (
              <h3 className="side-title">
                {t("ui.capturedDetailsTitle", {
                  defaultValue: "Captured Details",
                })}
              </h3>
            )}
            <div className="captured-summary">
              {formData.name && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.name")}:
                  </span>
                  <span className="summary-value">{formData.name}</span>
                </div>
              )}
              {formData.age && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.age")}:
                  </span>
                  <span className="summary-value">{formData.age}</span>
                </div>
              )}
              {formData.address && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.address")}:
                  </span>
                  <span className="summary-value">{formData.address}</span>
                </div>
              )}
              {formData.phone && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.phone")}:
                  </span>
                  <span className="summary-value">{formData.phone}</span>
                </div>
              )}
              {formData.shift_time && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.shift")}:
                  </span>
                  <span className="summary-value">{formData.shift_time}</span>
                </div>
              )}
              {formData.experience && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.experience")}:
                  </span>
                  <span className="summary-value">{formData.experience}</span>
                </div>
              )}
              {formData.job_title && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.jobType")}:
                  </span>
                  <span className="summary-value">{formData.job_title}</span>
                </div>
              )}
              {formData.salary_expectation && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.salary")}:
                  </span>
                  <span className="summary-value">
                    {formData.salary_expectation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversation panel */}
        <div className="ai-side-panel">
          <div className="side-section">
            <h3 className="side-title">
              {t("ui.conversationTitle", { defaultValue: "Conversation" })}
            </h3>
            <div className="conversation-list">
              {messages.map((m, idx) => (
                <div key={idx} className={`conv-item ${m.sender}`}>
                  <div className="conv-bubble">{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiAssistantPage;
