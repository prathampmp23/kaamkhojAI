import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./AiAssistantPage.css";
import { X, Mic } from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import axios from "axios";
import server from "../environment";
import { useAuthContext } from "../context/AuthContext";

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

  const { setCurrentUser, setIsAuthenticated } = useAuthContext();

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
  
  // Conversation mode state
  const [conversationMode, setConversationMode] = useState(false);
  const [storedJobs, setStoredJobs] = useState([]);
  const conversationModeRef = useRef(false);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    conversationModeRef.current = conversationMode;
  }, [conversationMode]);

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const currentFieldIndexRef = useRef(0);
  const [retryCounts, setRetryCounts] = useState({});
  const recognitionRef = useRef(null);
  const [userName, setUserName] = useState("User");
  const processingLockRef = useRef(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const isActiveRef = useRef(true);

  const [authReady, setAuthReady] = useState(() => {
    try {
      return !!localStorage.getItem("token");
    } catch {
      return false;
    }
  });

  const [authGate, setAuthGate] = useState({
    phone: "",
    pin: "",
    step: "check", // check | login | register
    loading: false,
    error: "",
    exists: null,
    profileName: null,
  });

  const normalizePhoneClient = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    const normalized = digits.length > 10 ? digits.slice(-10) : digits;
    if (normalized.length !== 10) return null;
    return normalized;
  };

  const authLogin = async ({ phone, pin }) => {
    const res = await fetch(`${server_url}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password: pin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    const userData = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("isLoggedIn", true);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);

    return userData;
  };

  const authRegister = async ({ phone, pin }) => {
    const res = await fetch(`${server_url}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password: pin, role: "seeker" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return true;
  };

  const fetchAndSetProfileName = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const profileRes = await fetch(`${server_url}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      const name = profileRes.ok ? profileData?.profile?.name : null;
      if (name) setUserName(name);
    } catch (e) {
      console.error("Profile name fetch error:", e);
    }
  };

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
    if (!authReady) return;
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

  useEffect(() => {
    if (!authReady) return;
    fetchAndSetProfileName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  const handleTranscript = async (text) => {
    if (!text || processingLockRef.current) return;
    processingLockRef.current = true;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    // Check if in conversation mode
    if (conversationModeRef.current) {
      try {
        // Call backend to answer based on stored jobs
        const res = await axios.post(`${server_url}/api/voice/answer-job-question`, {
          question: text,
          jobs: storedJobs,
          language: i18n.language,
          profile: formDataRef.current,
        });

        const { answer } = res.data;
        
        speak(answer, i18n.language);
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: answer, prompt: "" },
        ]);
      } catch (error) {
        console.error("Job Q&A error:", error);
        const fallbackAnswer = i18n.language === "hi" 
          ? "क्षमा करें, मैं आपके सवाल का जवाब नहीं दे पाया।"
          : i18n.language === "mr"
          ? "माफ करा, मी तुमच्या प्रश्नाचे उत्तर देऊ शकत नाही."
          : "Sorry, I couldn't answer your question.";
        
        speak(fallbackAnswer, i18n.language);
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: fallbackAnswer, prompt: "" },
        ]);
      }
      processingLockRef.current = false;
      return;
    }

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

            // Store jobs and enter conversation mode
            setStoredJobs(recommendedJobs || []);
            setConversationMode(true);
            conversationModeRef.current = true;

            let jobRecommendationSpeech = "";

            if (recommendedJobs && recommendedJobs.length > 0) {
              const jobCount = recommendedJobs.length;
              const jobTitles = recommendedJobs.slice(0, 3).map(job => job.jobName || job.title).filter(Boolean).join(", ");
              
              jobRecommendationSpeech = lang === "hi" 
                ? `बधाई हो! आपकी प्रोफाइल बन गई है। मैंने ${jobCount} नौकरियां पाईं: ${jobTitles}। अब आप मुझसे इन नौकरियों के बारे में कोई भी सवाल पूछ सकते हैं।`
                : lang === "mr"
                ? `अभिनंदन! तुमची प्रोफाईल तयार झाली आहे। मला ${jobCount} नोकऱ्या मिळाल्या: ${jobTitles}. आता तुम्ही या नोकऱ्यांबद्दल कोणताही प्रश्न विचारू शकता।`
                : `Congratulations! Your profile has been created. I found ${jobCount} jobs: ${jobTitles}. You can now ask me any questions about these jobs.`;
            } else {
              jobRecommendationSpeech = lang === "hi"
                ? "आपकी प्रोफाइल बन गई है, लेकिन अभी कोई नौकरी नहीं मिली। आप मुझसे नौकरी ढूंढने के बारे में पूछ सकते हैं।"
                : lang === "mr"
                ? "तुमची प्रोफाईल तयार झाली आहे, पण सध्या कोणतीही नोकरी मिळाली नाही। तुम्ही मला नोकरी शोधण्याबद्दल विचारू शकता।"
                : "Your profile has been created, but no jobs found yet. You can ask me about finding jobs.";
            }

            speak(jobRecommendationSpeech, lang);
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: jobRecommendationSpeech, prompt: "" },
            ]);
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

          {!authReady ? (
            <div className="side-section" style={{ width: "100%" }}>
              <h3 className="side-title">
                {i18n.language === "hi"
                  ? "पहले अपना फोन नंबर डालें"
                  : i18n.language === "mr"
                    ? "आधी फोन नंबर टाका"
                    : "Enter your phone number first"}
              </h3>
              <div className="captured-summary">
                <div className="summary-row" style={{ gap: 12, alignItems: "center" }}>
                  <span className="summary-label">
                    {i18n.language === "hi"
                      ? "फोन"
                      : i18n.language === "mr"
                        ? "फोन"
                        : "Phone"}
                    :
                  </span>
                  <input
                    type="text"
                    value={authGate.phone}
                    onChange={(e) =>
                      setAuthGate((p) => ({ ...p, phone: e.target.value, error: "" }))
                    }
                    placeholder={
                      i18n.language === "hi"
                        ? "10 अंकों का नंबर"
                        : i18n.language === "mr"
                          ? "10 अंकी नंबर"
                          : "10-digit number"
                    }
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </div>

                {authGate.step !== "check" && (
                  <div className="summary-row" style={{ gap: 12, alignItems: "center" }}>
                    <span className="summary-label">
                      {i18n.language === "hi"
                        ? "PIN"
                        : i18n.language === "mr"
                          ? "PIN"
                          : "PIN"}
                      :
                    </span>
                    <input
                      type="password"
                      value={authGate.pin}
                      onChange={(e) =>
                        setAuthGate((p) => ({ ...p, pin: e.target.value, error: "" }))
                      }
                      placeholder={
                        i18n.language === "hi"
                          ? "4 अंकों का PIN"
                          : i18n.language === "mr"
                            ? "4 अंकी PIN"
                            : "4-digit PIN"
                      }
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </div>
                )}

                {authGate.error ? (
                  <div style={{ color: "#b91c1c", marginTop: 8, fontSize: 14 }}>
                    {authGate.error}
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  {authGate.step === "check" ? (
                    <button
                      className="control-button mic-btn"
                      style={{ width: "auto", padding: "10px 14px" }}
                      disabled={authGate.loading}
                      onClick={async () => {
                        const phone = normalizePhoneClient(authGate.phone);
                        if (!phone) {
                          setAuthGate((p) => ({
                            ...p,
                            error:
                              i18n.language === "hi"
                                ? "कृपया सही 10 अंकों का फोन नंबर डालें"
                                : i18n.language === "mr"
                                  ? "कृपया योग्य 10 अंकी फोन नंबर टाका"
                                  : "Please enter a valid 10-digit phone number",
                          }));
                          return;
                        }

                        setAuthGate((p) => ({ ...p, loading: true, error: "" }));
                        try {
                          const res = await fetch(`${server_url}/api/auth/check-phone`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ phone }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.message || "Check failed");

                          if (data.exists) {
                            setAuthGate((p) => ({
                              ...p,
                              exists: true,
                              profileName: data.profileName || null,
                              step: "login",
                              loading: false,
                            }));

                            if (data.profileName) {
                              const msg =
                                i18n.language === "hi"
                                  ? `यह नंबर ${data.profileName} के नाम पर है। कृपया PIN डालें।`
                                  : i18n.language === "mr"
                                    ? `हा नंबर ${data.profileName} साठी आहे. कृपया PIN टाका.`
                                    : `This number belongs to ${data.profileName}. Please enter your PIN.`;
                              speak(msg, i18n.language);
                            }
                          } else {
                            setAuthGate((p) => ({
                              ...p,
                              exists: false,
                              profileName: null,
                              step: "register",
                              loading: false,
                            }));

                            const msg =
                              i18n.language === "hi"
                                ? "यह नया नंबर है। कृपया 4 अंकों का PIN बनाइए।"
                                : i18n.language === "mr"
                                  ? "हा नवीन नंबर आहे. कृपया 4 अंकी PIN तयार करा."
                                  : "New number. Please create a 4-digit PIN.";
                            speak(msg, i18n.language);
                          }
                        } catch (e) {
                          setAuthGate((p) => ({ ...p, loading: false, error: e.message }));
                        }
                      }}
                    >
                      {authGate.loading
                        ? i18n.language === "hi"
                          ? "जांच हो रही है..."
                          : i18n.language === "mr"
                            ? "तपासत आहे..."
                            : "Checking..."
                        : i18n.language === "hi"
                          ? "आगे बढ़ें"
                          : i18n.language === "mr"
                            ? "पुढे जा"
                            : "Continue"}
                    </button>
                  ) : (
                    <button
                      className="control-button mic-btn"
                      style={{ width: "auto", padding: "10px 14px" }}
                      disabled={authGate.loading}
                      onClick={async () => {
                        const phone = normalizePhoneClient(authGate.phone);
                        if (!phone) {
                          setAuthGate((p) => ({
                            ...p,
                            error:
                              i18n.language === "hi"
                                ? "कृपया सही 10 अंकों का फोन नंबर डालें"
                                : i18n.language === "mr"
                                  ? "कृपया योग्य 10 अंकी फोन नंबर टाका"
                                  : "Please enter a valid 10-digit phone number",
                          }));
                          return;
                        }
                        if (!authGate.pin || authGate.pin.length < 4) {
                          setAuthGate((p) => ({
                            ...p,
                            error:
                              i18n.language === "hi"
                                ? "PIN कम से कम 4 अंकों का होना चाहिए"
                                : i18n.language === "mr"
                                  ? "PIN किमान 4 अंकांचा असावा"
                                  : "PIN must be at least 4 digits",
                          }));
                          return;
                        }

                        setAuthGate((p) => ({ ...p, loading: true, error: "" }));
                        try {
                          if (authGate.step === "register") {
                            await authRegister({ phone, pin: authGate.pin });
                          }
                          await authLogin({ phone, pin: authGate.pin });
                          setAuthReady(true);
                          setAuthGate((p) => ({ ...p, loading: false }));

                          // Friendly voice confirmation after successful login
                          const nameToSpeak = authGate.profileName;
                          if (nameToSpeak) {
                            const msg =
                              i18n.language === "hi"
                                ? `स्वागत है ${nameToSpeak}`
                                : i18n.language === "mr"
                                  ? `स्वागत आहे ${nameToSpeak}`
                                  : `Welcome back ${nameToSpeak}`;
                            speak(msg, i18n.language);
                            setUserName(nameToSpeak);
                          }
                        } catch (e) {
                          setAuthGate((p) => ({ ...p, loading: false, error: e.message }));
                        }
                      }}
                    >
                      {authGate.loading
                        ? i18n.language === "hi"
                          ? "हो रहा है..."
                          : i18n.language === "mr"
                            ? "चालू आहे..."
                            : "Please wait..."
                        : authGate.step === "login"
                          ? i18n.language === "hi"
                            ? "लॉगिन"
                            : i18n.language === "mr"
                              ? "लॉगिन"
                              : "Login"
                          : i18n.language === "hi"
                            ? "खाता बनाएं"
                            : i18n.language === "mr"
                              ? "खाते तयार करा"
                              : "Create account"}
                    </button>
                  )}

                  {authGate.step !== "check" ? (
                    <button
                      className="control-button"
                      style={{ width: "auto", padding: "10px 14px" }}
                      disabled={authGate.loading}
                      onClick={() =>
                        setAuthGate({
                          phone: authGate.phone,
                          pin: "",
                          step: "check",
                          loading: false,
                          error: "",
                          exists: null,
                          profileName: null,
                        })
                      }
                    >
                      {i18n.language === "hi"
                        ? "बदलें"
                        : i18n.language === "mr"
                          ? "बदला"
                          : "Change"}
                    </button>
                  ) : null}
                </div>

                {authGate.step === "login" ? (
                  <div style={{ marginTop: 10, color: "#6b7280", fontSize: 14 }}>
                    {authGate.profileName
                      ? i18n.language === "hi"
                        ? `यह नंबर ${authGate.profileName} के नाम पर है। PIN डालें।`
                        : i18n.language === "mr"
                          ? `हा नंबर ${authGate.profileName} साठी आहे. PIN टाका.`
                          : `This number belongs to ${authGate.profileName}. Enter PIN.`
                      : i18n.language === "hi"
                        ? "यह नंबर पहले से है। PIN डालें।"
                        : i18n.language === "mr"
                          ? "हा नंबर आधीपासून आहे. PIN टाका."
                          : "This number already exists. Enter PIN."}
                  </div>
                ) : authGate.step === "register" ? (
                  <div style={{ marginTop: 10, color: "#6b7280", fontSize: 14 }}>
                    {i18n.language === "hi"
                      ? "यह नया नंबर है। 4 अंकों का PIN बनाइए और आगे बढ़िए।"
                      : i18n.language === "mr"
                        ? "हा नवीन नंबर आहे. 4 अंकी PIN तयार करा आणि पुढे जा."
                        : "New number. Create a 4-digit PIN to continue."}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <>
          <div className={`sphere ${isListening ? "listening" : ""}`}>
            <video
              className="voice-orb"
              src="/ai-video.mp4"
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
            </>
          )}
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
