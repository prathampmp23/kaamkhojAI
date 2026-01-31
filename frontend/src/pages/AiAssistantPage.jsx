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
  "shift_time",
  "experience",
  "skills",
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
    skills: {
      en: "Tell me your skills or work you can do (for example: driving, cooking, cleaning).",
      hi: "अपनी स्किल्स या आप कौन सा काम कर सकते हैं बताइए (जैसे: ड्राइविंग, खाना बनाना, सफाई)।",
      mr: "तुमच्या कौशल्या/तुम्ही कोणते काम करू शकता ते सांगा (उदा: ड्रायव्हिंग, स्वयंपाक, साफसफाई).",
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
    skills: {
      en: "Please tell your skills again. Keep it short (2 to 5 skills).",
      hi: "कृपया अपनी स्किल्स फिर से बताइए। 2 से 5 स्किल्स बोलिए।",
      mr: "कृपया तुमची कौशल्ये पुन्हा सांगा. 2 ते 5 कौशल्ये सांगा.",
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
    skills: "",
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

  const [accountAssist, setAccountAssist] = useState({
    step: "none", // none | ask_phone | ask_pin | working
    phone: "",
    pin: "",
    error: "",
  });

  const normalizePhoneClient = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    const normalized = digits.length > 10 ? digits.slice(-10) : digits;
    if (normalized.length !== 10) return null;
    return normalized;
  };

  const parsePinFromSpeech = (text) => {
    const digits = String(text || "").replace(/\D/g, "");
    if (digits.length >= 4) return digits.slice(-4);

    const lower = String(text || "").toLowerCase();
    const map = {
      zero: "0",
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ek: "1",
      एक: "1",
      don: "2",
      do: "2",
      दोन: "2",
      दो: "2",
      teen: "3",
      तीन: "3",
      tin: "3",
      char: "4",
      चार: "4",
      paanch: "5",
      पाच: "5",
      sah: "6",
      सहा: "6",
      saat: "7",
      सात: "7",
      aath: "8",
      आठ: "8",
      nau: "9",
      नऊ: "9",
      shunya: "0",
      शून्य: "0",
    };

    const tokens = lower.split(/\s+/).filter(Boolean);
    const out = tokens.map((t) => map[t]).filter(Boolean).join("");
    if (out.length >= 4) return out.slice(-4);
    return null;
  };

  const shouldStartSaveFlow = (text) => {
    const t = String(text || "").toLowerCase();
    return (
      t.includes("save") ||
      t.includes("pin") ||
      t.includes("login") ||
      t.includes("register") ||
      t.includes("account") ||
      t.includes("सेव") ||
      t.includes("पिन") ||
      t.includes("लॉगिन") ||
      t.includes("खाता") ||
      t.includes("सेव्ह") ||
      t.includes("पिन")
    );
  };

  const isSkipIntent = (text) => {
    const t = String(text || "").toLowerCase();
    return (
      t.includes("skip") ||
      t.includes("no") ||
      t.includes("nah") ||
      t.includes("nahi") ||
      t.includes("नहीं") ||
      t.includes("नाही")
    );
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
    currentFieldIndexRef.current = 0;
    setCurrentFieldIndex(0);

    const welcomeMessage = t("welcomeMessage", { userName });
    const firstField = flowOrder[0];
    const firstPrompt = getFieldPrompt(firstField, i18n.language);

    setMessages([{ sender: "ai", text: welcomeMessage, prompt: firstPrompt }]);
    speak(`${welcomeMessage} ${firstPrompt}`, i18n.language);

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
    if (!localStorage.getItem("token")) return;
    fetchAndSetProfileName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rankJobsForProfile = (profile, jobs) => {
    const title = String(profile?.job_title || "").toLowerCase();
    const addr = String(profile?.address || "").toLowerCase();
    const skills = String(profile?.skills || "").toLowerCase();
    const exp = Number(profile?.experience || 0);
    const salary = Number(profile?.salary_expectation || 0);

    const scoreJob = (job) => {
      const jobTitle = String(job?.jobName || job?.title || "").toLowerCase();
      const jobLoc = String(job?.location || "").toLowerCase();
      const jobDesc = String(job?.jobDescription || job?.description || "").toLowerCase();
      const jobSkills = Array.isArray(job?.skillsRequired)
        ? job.skillsRequired.join(" ").toLowerCase()
        : String(job?.skillsRequired || "").toLowerCase();

      let s = 0;
      if (title && (jobTitle.includes(title) || jobDesc.includes(title))) s += 8;
      if (addr && (jobLoc.includes(addr) || addr.includes(jobLoc))) s += 3;
      if (skills) {
        const skillTokens = skills.split(/[\,\s]+/).filter(Boolean);
        const hay = `${jobDesc} ${jobSkills}`;
        for (const tok of skillTokens.slice(0, 6)) {
          if (hay.includes(tok)) s += 1.5;
        }
      }
      if (!Number.isNaN(exp)) {
        const reqExp = Number(job?.experience || job?.experience_required || 0);
        if (!Number.isNaN(reqExp)) {
          if (exp >= reqExp) s += 1;
          else s -= 1;
        }
      }
      if (!Number.isNaN(salary)) {
        const jobSalary = Number(String(job?.salary || "").replace(/\D/g, ""));
        if (!Number.isNaN(jobSalary) && jobSalary > 0) {
          if (salary <= jobSalary) s += 1;
        }
      }
      return s;
    };

    return (jobs || [])
      .slice()
      .sort((a, b) => scoreJob(b) - scoreJob(a));
  };

  const handleTranscript = async (text) => {
    if (!text || processingLockRef.current) return;
    processingLockRef.current = true;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    // Account save/login helper flow (voice-first)
    if (accountAssist.step === "ask_phone") {
      const lang = i18n.language;
      if (isSkipIntent(text)) {
        const msg =
          lang === "hi"
            ? "ठीक है। आप अभी बिना PIN के भी सवाल पूछ सकते हैं।"
            : lang === "mr"
              ? "ठीक आहे. तुम्ही आता PIN शिवायही प्रश्न विचारू शकता."
              : "Okay. You can continue without a PIN.";
        speak(msg, lang);
        setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
        setAccountAssist({ step: "none", phone: "", pin: "", error: "" });
        processingLockRef.current = false;
        return;
      }

      const phone = normalizePhoneClient(text);
      if (!phone) {
        const retry =
          lang === "hi"
            ? "कृपया अपना 10 अंकों का मोबाइल नंबर धीरे-धीरे बोलिए। या 'skip' बोलिए।"
            : lang === "mr"
              ? "कृपया तुमचा 10 अंकी मोबाइल नंबर हळू बोला. किंवा 'skip' बोला."
              : "Please say your 10-digit mobile number slowly, or say 'skip'.";
        speak(retry, lang);
        setMessages((prev) => [...prev, { sender: "ai", text: retry, prompt: "" }]);
        processingLockRef.current = false;
        return;
      }

      try {
        setAccountAssist((p) => ({ ...p, step: "working", phone, error: "" }));
        const res = await fetch(`${server_url}/api/auth/check-phone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Check failed");

        if (data.exists) {
          const msg =
            lang === "hi"
              ? "यह नंबर पहले से है। कृपया अपना 4 अंकों का PIN बोलिए।"
              : lang === "mr"
                ? "हा नंबर आधीपासून आहे. कृपया तुमचा 4 अंकी PIN बोला."
                : "This number already exists. Please say your 4-digit PIN.";
          speak(msg, lang);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
          setAccountAssist({ step: "ask_pin", phone, pin: "", error: "" });
        } else {
          const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
          await authRegister({ phone, pin: generatedPin });
          await authLogin({ phone, pin: generatedPin });

          // Persist profile to the authenticated account
          const token = localStorage.getItem("token");
          if (token) {
            await axios.post(
              `${server_url}/api/auth/create-profile`,
              { ...formDataRef.current, phone },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          }

          setFormData((prev) => ({ ...prev, phone }));

          const msg =
            lang === "hi"
              ? `हो गया। आपका PIN है ${generatedPin}. अगली बार आप इसी मोबाइल और PIN से आवाज़ से लॉगिन कर सकते हैं।`
              : lang === "mr"
                ? `झाले. तुमचा PIN आहे ${generatedPin}. पुढच्या वेळी हाच मोबाइल आणि PIN वापरून लॉगिन करू शकता.`
                : `Done. Your PIN is ${generatedPin}. Next time you can login using this mobile and PIN.`;
          speak(msg, lang);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
          setAccountAssist({ step: "none", phone: "", pin: "", error: "" });
        }
      } catch (e) {
        const lang = i18n.language;
        const msg =
          lang === "hi"
            ? `माफ़ कीजिए, सेव नहीं हो पाया। ${e.message}`
            : lang === "mr"
              ? `माफ करा, सेव करता आले नाही. ${e.message}`
              : `Sorry, I couldn't save your profile. ${e.message}`;
        speak(msg, lang);
        setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
        setAccountAssist({ step: "none", phone: "", pin: "", error: "" });
      } finally {
        processingLockRef.current = false;
      }
      return;
    }

    if (accountAssist.step === "ask_pin") {
      const lang = i18n.language;
      const pin = parsePinFromSpeech(text);
      if (!pin) {
        const retry =
          lang === "hi"
            ? "कृपया अपना 4 अंकों का PIN फिर से बोलिए।"
            : lang === "mr"
              ? "कृपया तुमचा 4 अंकी PIN पुन्हा बोला."
              : "Please say your 4-digit PIN again.";
        speak(retry, lang);
        setMessages((prev) => [...prev, { sender: "ai", text: retry, prompt: "" }]);
        processingLockRef.current = false;
        return;
      }

      try {
        await authLogin({ phone: accountAssist.phone, pin });

        const token = localStorage.getItem("token");
        if (token) {
          await axios.post(
            `${server_url}/api/auth/create-profile`,
            { ...formDataRef.current, phone: accountAssist.phone },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }

        setFormData((prev) => ({ ...prev, phone: accountAssist.phone }));

        const msg =
          lang === "hi"
            ? "लॉगिन हो गया। अब आपका प्रोफाइल सेव हो गया है।"
            : lang === "mr"
              ? "लॉगिन झाले. आता तुमचा प्रोफाइल सेव झाला आहे."
              : "Logged in. Your profile is now saved.";
        speak(msg, lang);
        setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
        setAccountAssist({ step: "none", phone: "", pin: "", error: "" });
      } catch (e) {
        const msg =
          lang === "hi"
            ? "PIN गलत है। कृपया फिर से बोलिए।"
            : lang === "mr"
              ? "PIN चुकीचा आहे. कृपया पुन्हा बोला."
              : "Incorrect PIN. Please try again.";
        speak(msg, lang);
        setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
      } finally {
        processingLockRef.current = false;
      }
      return;
    }

    // Check if in conversation mode
    if (conversationModeRef.current) {
      if (shouldStartSaveFlow(text)) {
        const lang = i18n.language;
        const msg =
          lang === "hi"
            ? "ठीक है। अपना 10 अंकों का मोबाइल नंबर बोलिए। या 'skip' बोलिए।"
            : lang === "mr"
              ? "ठीक आहे. तुमचा 10 अंकी मोबाइल नंबर बोला. किंवा 'skip' बोला."
              : "Okay. Please say your 10-digit mobile number, or say 'skip'.";
        speak(msg, lang);
        setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
        setAccountAssist({ step: "ask_phone", phone: "", pin: "", error: "" });
        processingLockRef.current = false;
        return;
      }

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

            let createdProfile = null;
            let recommendedJobs = [];
            let profileId = null;

            if (token) {
              const profileRes = await axios.post(
                `${server_url}/api/auth/create-profile`,
                finalData,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              ({ profileId, user: createdProfile, recommendedJobs } = profileRes.data);
            } else {
              // Guest flow: store locally and fetch public jobs
              const jobsRes = await axios
                .get(`${server_url}/api/jobs/public`)
                .catch(() => axios.get(`${server_url}/api/jobs`));
              const jobs = jobsRes?.data?.jobs || [];
              recommendedJobs = rankJobsForProfile(finalData, jobs).slice(0, 5);
            }

            const profileToStore = createdProfile || finalData;

            localStorage.setItem(
              "workerProfile",
              JSON.stringify({
                profileId: profileId || null,
                name: profileToStore.name,
                age: profileToStore.age,
                address: profileToStore.address,
                phone: profileToStore.phone,
                shift_time: profileToStore.shift_time,
                experience: profileToStore.experience,
                skills: profileToStore.skills,
                job_title: profileToStore.job_title,
                salary_expectation: profileToStore.salary_expectation,
              }),
            );

            // Store jobs and enter conversation mode
            setStoredJobs(recommendedJobs || []);
            setConversationMode(true);
            conversationModeRef.current = true;

            let jobRecommendationSpeech = "";

            if (recommendedJobs && recommendedJobs.length > 0) {
              const jobCount = recommendedJobs.length;
              const jobTitles = recommendedJobs
                .slice(0, 3)
                .map((job) => job.jobName || job.title)
                .filter(Boolean)
                .join(", ");

              jobRecommendationSpeech =
                lang === "hi"
                  ? `बधाई हो! आपकी प्रोफाइल तैयार है। मैंने ${jobCount} नौकरियां पाईं: ${jobTitles}। अब आप इन नौकरियों के बारे में कोई भी सवाल पूछ सकते हैं।`
                  : lang === "mr"
                    ? `अभिनंदन! तुमची प्रोफाईल तयार आहे। मला ${jobCount} नोकऱ्या मिळाल्या: ${jobTitles}. आता तुम्ही या नोकऱ्यांबद्दल कोणताही प्रश्न विचारू शकता.`
                    : `Great! Your profile is ready. I found ${jobCount} jobs: ${jobTitles}. You can now ask me any questions about these jobs.`;
            } else {
              jobRecommendationSpeech =
                lang === "hi"
                  ? "आपकी प्रोफाइल तैयार है, लेकिन अभी कोई नौकरी नहीं मिली। आप मुझसे नौकरी ढूंढने के बारे में पूछ सकते हैं।"
                  : lang === "mr"
                    ? "तुमची प्रोफाईल तयार आहे, पण सध्या कोणतीही नोकरी मिळाली नाही. तुम्ही मला नोकरी शोधण्याबद्दल विचारू शकता."
                    : "Your profile is ready, but no jobs found yet. You can ask me about finding jobs.";
            }

            const saveHint =
              token
                ? ""
                : lang === "hi"
                  ? "अगर आप चाहें तो अगली बार के लिए PIN बनवा सकते हैं। बोलिए: 'save my profile'."
                  : lang === "mr"
                    ? "तुम्हाला पुढच्या वेळेसाठी PIN हवा असेल तर बोला: 'save my profile'."
                    : "If you want a PIN for next time, say: 'save my profile'.";

            speak(`${jobRecommendationSpeech} ${saveHint}`.trim(), lang);
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: `${jobRecommendationSpeech} ${saveHint}`.trim(), prompt: "" },
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
              {formData.skills && (
                <div className="summary-row">
                  <span className="summary-label">
                    {t("assistantPage.labels.skills", { defaultValue: "Skills" })}:
                  </span>
                  <span className="summary-value">{formData.skills}</span>
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
