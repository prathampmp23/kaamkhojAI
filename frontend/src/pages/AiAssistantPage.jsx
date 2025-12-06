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
      en: "Please click the mic again and say your full name clearly.",
      hi: "कृपया दोबारा माइक पर क्लिक करें और अपना पूरा नाम साफ़-साफ़ बोलिए।",
      mr: "कृपया पुन्हा माईकवर क्लिक करा आणि तुमचे पूर्ण नाव स्पष्ट बोला.",
    },
    age: {
      en: "Please say your age in years (for example: twenty three).",
      hi: "कृपया अपनी उम्र सालों में बताइए (जैसे: तेईस)।",
      mr: "कृपया तुमचे वय वर्षांत सांगा (उदा.: तेवीस).",
    },
    address: {
      en: "Please say your address or nearby area again.",
      hi: "कृपया अपना पता या आस-पास का इलाका फिर से बताइए।",
      mr: "कृपया तुमचा पत्ता किंवा जवळचा परिसर पुन्हा सांगा.",
    },
    phone: {
      en: "Please say your 10-digit phone number slowly.",
      hi: "कृपया अपना 10 अंकों का फोन नंबर धीरे-धीरे बोलिए।",
      mr: "कृपया तुमचा 10 अंकी फोन नंबर हळू आवाजात सांगा.",
    },
    shift_time: {
      en: "Say day, night, or flexible.",
      hi: "दिन, रात, या लचीला बोलिए।",
      mr: "दिवस, रात्र, किंवा लवचिक बोला.",
    },
    experience: {
      en: "Say how many years of experience you have.",
      hi: "बताइए आपके पास कितने साल का अनुभव है।",
      mr: "तुमच्याकडे किती वर्षांचा अनुभव आहे ते सांगा.",
    },
    job_title: {
      en: "Say your desired job type again.",
      hi: "अपनी मनचाही नौकरी का प्रकार फिर से बोलिए।",
      mr: "तुमची इच्छित नोकरीचा प्रकार पुन्हा सांगा.",
    },
    salary_expectation: {
      en: "What monthly salary do you expect? Please say it clearly, for example: twenty thousand, or say the digits one by one, like: two zero zero zero zero.",
      hi: "आप कितनी मासिक तनख्वाह की उम्मीद करते हैं? कृपया साफ़ बोलें, जैसे: बीस हज़ार, या अंकों में एक-एक करके: 2 0 0 0 0.",
      mr: "तुम्ही मासिक किती पगार अपेक्षित करता? कृपया स्पष्ट बोला, जसे: वीस हजार, किंवा आकडे एकेक करून: 2 0 0 0 0.",
    },
  };

  const langKey = lang === "hi" ? "hi" : lang === "mr" ? "mr" : "en";
  return prompts[field]?.[langKey] || "";
};

// simple name heuristic, same as your original
const isLikelyName = (text) => {
  if (!text) return false;
  const cleaned = text.trim();
  if (/\d/.test(cleaned)) return false;

  const badKeywords = [
    "year",
    "years",
    "age",
    "address",
    "phone",
    "number",
    "salary",
    "shift",
    "experience",
    "job",
    "umar",
    "umra",
    "patta",
    "pata",
    "mobile",
    "nambar",
    "tankhwa",
    "pagar",
    "anubhav",
    "nokari",
  ];
  const lower = cleaned.toLowerCase();
  if (badKeywords.some((k) => lower.includes(k))) return false;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 3) return false;
  if (
    !words.every((w) =>
      /^[A-Za-z\u0900-\u097F\u0995-\u09FF\u0A80-\u0AFF\-']+$/.test(w)
    )
  )
    return false;

  const generic = [
    "yes",
    "no",
    "haan",
    "na",
    "ho",
    "nahi",
    "नहीं",
    "हो",
    "हां",
  ];
  if (generic.includes(lower)) return false;

  return true;
};

const AiAssistantPage = () => {
  const navigate = useNavigate();
  const server_url = `${server}`;

  const { t, i18n } = useTranslation();
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
  const currentFieldIndexRef = useRef(0); // 🔑 source of truth for field index
  const [retryCounts, setRetryCounts] = useState({});
  const recognitionRef = useRef(null);
  const [userName] = useState("User");
  const processingLockRef = useRef(false);

  //   useEffect(() => {
  //     // This runs when AiAssistantPage is mounted

  //     return () => {
  //       // This runs automatically when AiAssistantPage unmounts
  //       if (recognitionRef.current) {
  //         try {
  //           recognitionRef.current.onresult = null;
  //           recognitionRef.current.onend = null;
  //           recognitionRef.current.onerror = null;
  //           recognitionRef.current.stop();
  //           recognitionRef.current.abort && recognitionRef.current.abort();
  //         } catch (e) {
  //           console.error("Error stopping recognition on unmount:", e);
  //         }
  //       }

  //       if (window.speechSynthesis) {
  //         try {
  //           window.speechSynthesis.cancel();
  //         } catch (e) {
  //           console.error("Error cancelling speechSynthesis on unmount:", e);
  //         }
  //       }
  //     };
  //   }, []);

  //   const isActiveRef = useRef(true);

  //   useEffect(() => {
  //     isActiveRef.current = true;
  //     return () => {
  //       isActiveRef.current = false;
  //     };
  //   }, []);

  const speak = (text, lang, onend) => {
    if (!window.speechSynthesis || !text) return;
    // if (!isActiveRef.current) return; // don't speak if page is no longer active

    const utterance = new SpeechSynthesisUtterance(text);
    const locale =
      lang === "en"
        ? "en-IN"
        : lang === "hi"
        ? "hi-IN"
        : lang === "mr"
        ? "mr-IN"
        : lang;
    utterance.lang = locale;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(locale.toLowerCase())
    );
    if (match) utterance.voice = match;
    if (onend) utterance.onend = onend;

    const wrappedOnEnd = () => {
      if (!isActiveRef.current) return;
      onend && onend();
    };
    if (onend) utterance.onend = wrappedOnEnd;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Helper to get current field safely
  const getCurrentField = () => flowOrder[currentFieldIndexRef.current];

  // Helper to advance to next field (never backwards)
  const goToNextField = () => {
    const nextIndex = Math.min(
      currentFieldIndexRef.current + 1,
      flowOrder.length - 1
    );
    currentFieldIndexRef.current = nextIndex;
    setCurrentFieldIndex(nextIndex);
  };

  useEffect(() => {
    // reset field index ref on language/user change
    currentFieldIndexRef.current = 0;
    setCurrentFieldIndex(0);

    const welcomeMessage = t("welcomeMessage", { userName });
    const prompt = t("prompt");

    setMessages([{ sender: "ai", text: welcomeMessage, prompt }]);
    // Speak welcome + generic instructions (not field specific)
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
        // stop listening BEFORE processing to avoid echo
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
    if (!text) return;
    if (processingLockRef.current) return;
    processingLockRef.current = true;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    const field = getCurrentField();
    const lang = i18n.language;

    try {
      const res = await axios.post(`${server_url}/api/voice/process`, {
        text,
        fieldType: field,
      });

      const { success, extractedValue } = res.data;
      let value = extractedValue;

      // extra guard for age
      if (field === "age" && (!success || !value)) {
        const digits = (text || "").replace(/\D/g, "").match(/(\d{1,2})/);
        if (digits) value = parseInt(digits[1], 10);
      }

      if ((success || value !== null) && value !== "") {
        // we have a usable value
        setFormData((prev) => {
          const updated = { ...prev, [field]: value };
          console.log("Captured field:", field, "=", value);
          return updated;
        });

        // reset retry count for this field
        setRetryCounts((prev) => ({ ...prev, [field]: 0 }));

        if (currentFieldIndexRef.current + 1 < flowOrder.length) {
          // advance to next field
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
          // all fields filled -> submit profile
          try {
            const finalData = {
              ...formDataRef.current, // use the up-to-date ref
              [field]: value, // and override with the last captured field
            };

            console.log("Submitting finalData:", finalData);

            const profileRes = await axios.post(
              `${server_url}/api/auth/create-profile`,
              finalData
            );

            const {
              profileId,
              user: createdProfile,
              recommendedJobs,
            } = profileRes.data;

            // 🔹 Save worker profile locally for ProfilePage
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
              })
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
              // e.g. "No exact matches found. I'll show you all jobs."
            }

            speak(jobRecommendationSpeech, lang);
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: jobRecommendationSpeech, prompt: "" },
            ]);

            // Redirect to jobs page with recommended jobs
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
        // extractor failed -> retry logic
        // special case for name: accept if it "looks like" a name
        if (field === "name" && text && isLikelyName(text.trim())) {
          setFormData((prev) => ({ ...prev, name: text.trim() }));
          // move to age
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
          setRetryCounts((prev) => {
            const count = (prev[field] || 0) + 1;
            const nextCounts = { ...prev, [field]: count };
            const retryPrompt = getRetryPrompt(field, lang);

            if (count >= 2 && text && text.trim()) {
              // after 2 retries, accept raw text (except very bad name)
              if (field === "name" && !isLikelyName(text.trim())) {
                speak(retryPrompt, lang);
                setMessages((prevMsgs) => [
                  ...prevMsgs,
                  { sender: "ai", text: retryPrompt, prompt: "" },
                ]);
              } else {
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
              }
            } else {
              speak(retryPrompt, lang);
              setMessages((prevMsgs) => [
                ...prevMsgs,
                { sender: "ai", text: retryPrompt, prompt: "" },
              ]);
            }

            return nextCounts;
          });
        }
      }
    } catch (error) {
      console.error("Error processing text:", error);
      const errorMessage = t("connectionError");
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: errorMessage, prompt: "" },
      ]);
      speak(errorMessage, i18n.language);
    } finally {
      processingLockRef.current = false;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Just start listening; do not speak here to avoid echo
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
            <button className="control-button" onClick={toggleListening}>
              <Mic />
            </button>
          </div>

          <div className="captured-fields" style={{ marginTop: 12 }}>
            <div>
              <strong>Name:</strong> {formData.name || "-"}
            </div>
            <div>
              <strong>Age:</strong> {formData.age || "-"}
            </div>
            <div>
              <strong>Address:</strong> {formData.address || "-"}
            </div>
            <div>
              <strong>Phone:</strong> {formData.phone || "-"}
            </div>
            <div>
              <strong>Shift:</strong> {formData.shift_time || "-"}
            </div>
            <div>
              <strong>Experience:</strong> {formData.experience || "-"}
            </div>
            <div>
              <strong>Job Type:</strong> {formData.job_title || "-"}
            </div>
            <div>
              <strong>Salary:</strong> {formData.salary_expectation || "-"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiAssistantPage;
