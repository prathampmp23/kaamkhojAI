import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./AiAssistantPage.css";
import { X, Mic } from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import axios from "axios";
import server from "../environment";
import { useAuthContext } from "../context/AuthContext";
import { translateJobs } from "../utils/translateJobs";

const profileFlowOrder = [
  "name",
  "experience",
  "job_title",
  "shift_time",
  "salary_expectation",
  "address",
  "age",
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
  
  // Track current language to force re-renders
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = (lang) => {
    try {
      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      i18n.changeLanguage(lang);
      localStorage.setItem("preferredLanguage", lang);
      
      // Reload page to apply all translations including jobs data
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (e) {
      console.error("Language change error:", e);
    }
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
  const rawJobsRef = useRef([]); // Store original untranslated jobs
  const conversationModeRef = useRef(false);
  const storedJobsRef = useRef([]);
  const [selectedJobIndex, setSelectedJobIndex] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const hasInitializedRef = useRef(false);
  const SESSION_KEY = "kaamkhoj_ai_assistant_session_v1";

  useEffect(() => {
    storedJobsRef.current = Array.isArray(storedJobs) ? storedJobs : [];
  }, [storedJobs]);

  const clearAssistantSession = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("workerProfile");
    } catch {}
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Persist the assistant UI session (not auth). Keeps history when user switches language.
    try {
      const payload = {
        messages: Array.isArray(messages) ? messages.slice(-200) : [],
        selectedJobIndex,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch {}
  }, [messages, selectedJobIndex]);

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

  const [authFlow, setAuthFlow] = useState({
    stage: "ask_phone", // ask_phone | ask_pin | collect_profile | loading
    phone: "",
    profileName: null,
    exists: null,
  });
  const authFlowRef = useRef(authFlow);
  useEffect(() => {
    authFlowRef.current = authFlow;
  }, [authFlow]);

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

  const say = (en, hi, mr) => {
    const lang = i18n.language;
    if (lang === "hi") return hi;
    if (lang === "mr") return mr;
    return en;
  };

  const normalizeText = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const isLocationJobsRequest = (q) => {
    const raw = String(q || "");
    const n = normalizeText(raw);
    return (
      /which.*jobs.*in|jobs.*in|in\s+[a-z]+\s+jobs/.test(n) ||
      (/(pune|mumbai|nagpur|delhi)/.test(n) && /(job|jobs|naukri|naukriya)/.test(n)) ||
      /मे\s*कौन\s*सी\s*नौकरी|में\s*कौन\s*सी\s*नौकरी|कौन\s*सी\s*नौकरी.*(पुणे|मुंबई|नागपुर|दिल्ली)/.test(raw) ||
      /(पुणे|मुंबई|नागपुर|दिल्ली).*नौकरी\s*कौन\s*सी/.test(raw) ||
      /(पुणे|मुंबई|नागपुर|दिल्ली)/.test(raw) && /नौकरी|जॉब|jobs?/i.test(raw)
    );
  };

  const extractCityFromQuestion = (q) => {
    const raw = String(q || "");
    const lower = raw.toLowerCase();
    if (/pune|पुणे/.test(raw)) return "pune";
    if (/mumbai|मुंबई/.test(raw)) return "mumbai";
    if (/nagpur|नागपुर/.test(raw)) return "nagpur";
    if (/delhi|दिल्ली/.test(raw)) return "delhi";

    // Basic English fallback: "in <city>"
    const m = lower.match(/\bin\s+([a-z]{3,})\b/);
    if (m) return m[1];
    return null;
  };

  const isShowJobsRequest = (q) => {
    const raw = String(q || "");
    const n = normalizeText(raw);
    return (
      /show( me)? (the )?(recommended )?jobs|list (the )?jobs|recommended jobs/.test(n) ||
      /jobs? dikha|job(s)? dikhana|naukri(ya)? dikha|नौकर(ी|ि)या(ँ|ं)?|नौकरी.*दिखा|रिकमेंड.*(जॉब|नौकरी)|जॉब.*शो/.test(raw) ||
      /नोकऱ्या.*दाखव|रिकमेंड.*(नोकरी|जॉब)/.test(raw)
    );
  };

  const isJobDetailsRequest = (q) => {
    const raw = String(q || "");
    const n = normalizeText(raw);
    return (
      /details|full details|more info|information|show details/.test(n) ||
      /detail(s)? dikha|poori detail|पूरा विवरण|डिटेल(्स)?|डिटेल.*दिखा|विवरण.*दिखा|details.*show/.test(raw) ||
      /सविस्तर|डिटेल.*दाखव|माहिती.*दाखव/.test(raw)
    );
  };

  const detectJobKeyword = (q) => {
    const raw = String(q || "");
    const n = normalizeText(raw);

    const mappings = [
      { key: "personal driver", patterns: [/personal\s+driver/, /पर्सनल\s*ड्राइवर/, /पर्सनल\s*ड्रायव्हर/] },
      { key: "delivery driver", patterns: [/delivery\s+driver/, /डिलीवरी\s*ड्राइवर/, /डिलिव्हरी\s*ड्रायव्हर/] },
      { key: "truck driver", patterns: [/truck\s+driver/, /ट्रक\s*ड्राइवर/, /ट्रक\s*ड्रायव्हर/] },
      { key: "driver", patterns: [/\bdriver\b/, /ड्राइवर/, /ड्रायव्हर/, /चालक/] },
      { key: "security", patterns: [/\bsecurity\b/, /guard/, /सिक्योरिटी/, /सुरक्षा/, /रक्षक/] },
      { key: "cook", patterns: [/\bcook\b/, /chef/, /रसोइया/, /स्वयंपाकी/] },
      { key: "cleaner", patterns: [/\bcleaner\b/, /सफाई/, /cleaning/, /सफाईवाला/, /सफाईवाली/] },
    ];

    for (const m of mappings) {
      if (m.patterns.some((p) => (p instanceof RegExp ? p.test(raw) || p.test(n) : false))) {
        return m.key;
      }
    }
    return null;
  };

  const extractCategoryFromQuestion = (q) => {
    const raw = String(q || "");
    const n = normalizeText(raw);

    const categories = [
      { key: "driver", patterns: [/\bdriver\b/, /ड्राइवर/, /ड्रायव्हर/, /चालक/] },
      { key: "cook", patterns: [/\bcook\b/, /chef/, /रसोइया/, /स्वयंपाकी/] },
      { key: "cleaner", patterns: [/\bcleaner\b/, /cleaning/, /सफाई/, /सफाईवाला/, /सफाईवाली/] },
      { key: "gardener", patterns: [/\bgardener\b/, /garden/, /माली/, /बागकाम/] },
      { key: "plumber", patterns: [/\bplumber\b/, /प्लंबर/, /नळकाम/] },
      { key: "electrician", patterns: [/\belectrician\b/, /इलेक्ट्रीशियन/, /वीज/] },
      { key: "security", patterns: [/\bsecurity\b/, /guard/, /सिक्योरिटी/, /सुरक्षा/, /रक्षक/] },
      { key: "factory", patterns: [/\bfactory\b/, /manufactur/, /फॅक्टरी/, /कारखाना/] },
      { key: "construction", patterns: [/\bconstruction\b/, /builder/, /मजदूर/, /बांधकाम/] },
      { key: "house-help", patterns: [/house\s*help/, /maid/, /घरकाम/, /घराबाई/] },
      { key: "office-helper", patterns: [/office\s*help/, /helper/, /assistant/, /ऑफिस\s*हेल्पर/] },
    ];

    for (const c of categories) {
      if (c.patterns.some((p) => p.test(raw) || p.test(n))) return c.key;
    }
    return null;
  };

  const searchJobsFromServer = async ({ location, category, q, limit = 10 }) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token missing");

    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    params.set("limit", String(limit));

    const res = await fetch(`${server_url}/api/jobs/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Search failed");
    return Array.isArray(data.jobs) ? data.jobs : [];
  };

  const isAnyOneJobInfoRequest = (q) => {
    const raw = String(q || "");
    const n = normalizeText(raw);
    return (
      /any\s*one|one\s*job|show\s*(me\s*)?a\s*job|job\s*info/.test(n) ||
      /किसी\s*भी\s*एक|कोई\s*एक|एक\s*नौकरी|एक\s*जॉब|जानकारी\s*शो|जानकारी\s*दिखा/.test(raw) ||
      /कोणतीही\s*एक|एक\s*नोकरी|माहिती\s*दाखव/.test(raw)
    );
  };

  const isContactRequest = (q) => {
    const raw = String(q || "");
    const n = normalizeText(raw);
    return (
      /contact|phone|number|call|mobile|whatsapp/.test(n) ||
      /contact.*detail|contact.*number|job giver.*number/.test(n) ||
      /कॉन्टैक्ट|कॉन्टेक्ट|फोन|मोबाइल|नंबर|व्हाट्सएप|कॉल|जॉब\s*गिवर\s*नंबर|मालिक\s*का\s*नंबर|कंपनी\s*का\s*नंबर/.test(raw) ||
      /काँटॅक्ट|फोन|मोबाईल|क्रमांक|व्हॉट्सअॅप|कॉल|मालक.*क्रमांक/.test(raw)
    );
  };

  const getJobContactPhone = (job) => {
    return (
      job?.contactPhone ||
      job?.postedByPhone ||
      job?.postedBy?.phone ||
      job?.contact ||
      null
    );
  };

  const parseJobNumberFromQuestion = (q) => {
    const raw = String(q || "");
    const digits = raw.replace(/\D/g, "");
    if (digits) {
      const n = parseInt(digits, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 50) return n;
    }
    // Hindi/Marathi ordinals (basic)
    if (/पहली|पहला|पहले/.test(raw)) return 1;
    if (/दूसरी|दूसरा|दूसरे/.test(raw)) return 2;
    if (/तीसरी|तीसरा|तीसरे/.test(raw)) return 3;
    if (/पहिली|पहिला/.test(raw)) return 1;
    if (/दुसरी|दुसरा/.test(raw)) return 2;
    if (/तिसरी|तिसरा/.test(raw)) return 3;
    return null;
  };

  const formatJobShort = (job, idx) => {
    const title = job?.jobName || job?.title || job?.jobTitle || "";
    const salary = job?.salary || "";
    const location = job?.location || "";
    return say(
      `Job ${idx + 1}: ${title}${salary ? `, Salary: ${salary}` : ""}${location ? `, Location: ${location}` : ""}`,
      `नौकरी ${idx + 1}: ${title}${salary ? `, सैलरी: ${salary}` : ""}${location ? `, लोकेशन: ${location}` : ""}`,
      `नोकरी ${idx + 1}: ${title}${salary ? `, पगार: ${salary}` : ""}${location ? `, ठिकाण: ${location}` : ""}`
    );
  };

  const formatJobDetails = (job, idx) => {
    const title = job?.jobName || job?.title || job?.jobTitle || "";
    const company = job?.company || job?.companyName || "";
    const salary = job?.salary || "";
    const location = job?.location || "";
    const shift = job?.availability || job?.shift_time || "";
    const exp = job?.experience || job?.experience_required || "";
    const desc = job?.jobDescription || job?.description || "";

    return say(
      `Job ${idx + 1}: ${title}. Company: ${company || "Not specified"}. Salary: ${salary || "Not specified"}. Location: ${location || "Not specified"}. Shift: ${shift || "Not specified"}. Experience: ${exp || "Not specified"}. ${desc ? `Description: ${desc}` : ""}`,
      `नौकरी ${idx + 1}: ${title}. कंपनी: ${company || "उल्लेख नहीं है"}. सैलरी: ${salary || "उल्लेख नहीं है"}. लोकेशन: ${location || "उल्लेख नहीं है"}. शिफ्ट: ${shift || "उल्लेख नहीं है"}. अनुभव: ${exp || "उल्लेख नहीं है"}. ${desc ? `विवरण: ${desc}` : ""}`,
      `नोकरी ${idx + 1}: ${title}. कंपनी: ${company || "नमूद नाही"}. पगार: ${salary || "नमूद नाही"}. ठिकाण: ${location || "नमूद नाही"}. शिफ्ट: ${shift || "नमूद नाही"}. अनुभव: ${exp || "नमूद नाही"}. ${desc ? `वर्णन: ${desc}` : ""}`
    );
  };

  const getAuthPrompt = (stage, profileName) => {
    if (stage === "ask_phone") {
      return say(
        "Please tell your 10-digit mobile number.",
        "कृपया अपना 10 अंकों का मोबाइल नंबर बताइए।",
        "कृपया तुमचा 10 अंकी मोबाइल नंबर सांगा."
      );
    }
    if (stage === "ask_pin") {
      const base = profileName
        ? say(
            `Welcome back ${profileName}.`,
            `${profileName}, आपका स्वागत है।`,
            `${profileName}, स्वागत आहे.`
          )
        : "";
      const ask = say(
        "Please tell your 4-digit PIN.",
        "कृपया अपना 4 अंकों का PIN बताइए।",
        "कृपया तुमचा 4 अंकी PIN सांगा."
      );
      return `${base} ${ask}`.trim();
    }
    return "";
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

    const makeSpeechFriendly = (value) => {
      const langKey = lang === "hi" ? "hi" : lang === "mr" ? "mr" : "en";
      let out = String(value || "");

      // Salary ranges: "₹20,000 - ₹25,000" -> avoid reading '-' as 'minus'
      const rangeRe = /₹\s*([\d,]+)\s*-\s*₹\s*([\d,]+)/g;
      out = out.replace(rangeRe, (_m, a, b) => {
        if (langKey === "hi") return `₹${a} से ₹${b} तक`;
        if (langKey === "mr") return `₹${a} ते ₹${b} पर्यंत`;
        return `₹${a} to ₹${b}`;
      });

      // Generic numeric ranges: "20000 - 25000"
      const numRangeRe = /\b(\d[\d,]{2,})\s*-\s*(\d[\d,]{2,})\b/g;
      out = out.replace(numRangeRe, (_m, a, b) => {
        if (langKey === "hi") return `${a} से ${b} तक`;
        if (langKey === "mr") return `${a} ते ${b} पर्यंत`;
        return `${a} to ${b}`;
      });

      return out;
    };

    const speechText = makeSpeechFriendly(text);
    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Normalize language input - use i18n.language if lang is passed as normalized form
    let normalizedLang = lang;
    if (lang === "en-US" || lang === "en-IN" || lang === "en") normalizedLang = "en";
    if (lang === "hi-IN" || lang === "hi") normalizedLang = "hi";
    if (lang === "mr-IN" || lang === "mr") normalizedLang = "mr";
    
    const requested =
      normalizedLang === "en"
        ? "en-IN"
        : normalizedLang === "hi"
          ? "hi-IN"
          : normalizedLang === "mr"
            ? "mr-IN"
            : "en-IN";

    const voices = window.speechSynthesis.getVoices();
    const lower = (s) => (s || "").toLowerCase();
    const findExact = voices.find((v) => lower(v.lang) === lower(requested));
    const base = lower(requested).split("-")[0];
    const findBase = voices.find((v) => lower(v.lang).startsWith(base));
    const findHindi = voices.find((v) => lower(v.lang).startsWith("hi"));
    const findMarathi = voices.find((v) => lower(v.lang).startsWith("mr"));
    const findEnIn = voices.find((v) => lower(v.lang).startsWith("en-in"));
    const findEn = voices.find((v) => lower(v.lang).startsWith("en"));

    let chosen = findExact || findBase;
    if (!chosen && base === "mr") {
      chosen = findMarathi || findHindi || findEnIn || findEn;
    }
    if (!chosen) {
      chosen = findEnIn || findEn || null;
    }

    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang || requested;
    } else {
      utterance.lang = requested;
    }
    
    // Set rate and pitch for better speech
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const wrappedOnEnd = () => {
      if (!isActiveRef.current) return;
      onend && onend();
    };
    if (onend) utterance.onend = wrappedOnEnd;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const getCurrentField = () => profileFlowOrder[currentFieldIndexRef.current];

  const goToNextField = () => {
    const nextIndex = Math.min(
      currentFieldIndexRef.current + 1,
      profileFlowOrder.length - 1,
    );
    currentFieldIndexRef.current = nextIndex;
    setCurrentFieldIndex(nextIndex);
  };

  const hydrateAuthenticatedSession = async ({ speakIntro }) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    let profile = null;
    try {
      const profileRes = await fetch(`${server_url}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      profile = profileRes.ok ? profileData?.profile || null : null;
    } catch (e) {
      console.error("Profile fetch error:", e);
    }

    if (profile) {
      setFormData((prev) => ({ ...prev, ...profile, phone: profile.phone || prev.phone }));
      if (profile.name) setUserName(profile.name);
      try {
        localStorage.setItem(
          "workerProfile",
          JSON.stringify({
            profileId: profile._id || null,
            name: profile.name,
            age: profile.age,
            address: profile.address,
            phone: profile.phone,
            shift_time: profile.shift_time,
            experience: profile.experience,
            job_title: profile.job_title,
            salary_expectation: profile.salary_expectation,
          })
        );
      } catch {}
    }

    try {
      const jobsRes = await fetch(`${server_url}/api/jobs/recommended`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsRes.json();
      const jobs = jobsRes.ok ? jobsData.jobs || [] : [];
      
      // Store raw jobs and translate them
      rawJobsRef.current = jobs;
      const translatedJobs = await translateJobs(server_url, jobs, i18n.language);
      setStoredJobs(translatedJobs);
      storedJobsRef.current = Array.isArray(translatedJobs) ? translatedJobs : [];
      setConversationMode(true);
      conversationModeRef.current = true;

      if (speakIntro) {
        const top3 = (translatedJobs || []).slice(0, 3).map((j) => j.jobName || j.title).filter(Boolean);
        const intro = profile?.name
          ? say(`Hello ${profile.name}.`, `${profile.name}, नमस्ते।`, `${profile.name}, नमस्कार.`)
          : say("Hello.", "नमस्ते।", "नमस्कार.");
        const jobsMsg =
          top3.length > 0
            ? say(
                `I found jobs for you: ${top3.join(", ")}. You can ask me anything about these jobs.`,
                `आपके लिए नौकरियां मिली हैं: ${top3.join(", ")}. आप इन नौकरियों के बारे में कुछ भी पूछ सकते हैं।`,
                `तुमच्यासाठी नोकऱ्या मिळाल्या आहेत: ${top3.join(", ")}. तुम्ही या नोकऱ्यांबद्दल काहीही विचारू शकता.`
              )
            : say(
                "I could not find jobs right now, but you can still ask me questions.",
                "अभी मुझे नौकरी नहीं मिली, लेकिन आप मुझसे सवाल पूछ सकते हैं।",
                "सध्या नोकऱ्या मिळाल्या नाहीत, पण तुम्ही मला प्रश्न विचारू शकता."
              );
        const finalMsg = `${intro} ${jobsMsg}`.trim();
        speak(finalMsg, i18n.language);
        setMessages((prev) => [...prev, { sender: "ai", text: finalMsg, prompt: "" }]);
      }

      return true;
    } catch (e) {
      console.error("Recommended jobs fetch error:", e);
      return false;
    }
  };

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Restore assistant history (do NOT touch auth).
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
        }
        if (typeof parsed?.selectedJobIndex === "number") {
          setSelectedJobIndex(parsed.selectedJobIndex);
        }
      }
    } catch {}

    // Initialize speech recognition once.
    if ("webkitSpeechRecognition" in window) {
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

    // If user is already logged in, keep it and hydrate jobs without clearing session.
    const token = localStorage.getItem("token");
    const hasHistory = (() => {
      try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        return Array.isArray(parsed?.messages) && parsed.messages.length > 0;
      } catch {
        return false;
      }
    })();

    if (token) {
      hydrateAuthenticatedSession({ speakIntro: !hasHistory });
      return;
    }

    // Fresh start (no token): begin phone-first flow.
    currentFieldIndexRef.current = 0;
    setCurrentFieldIndex(0);
    setConversationMode(false);
    conversationModeRef.current = false;
    setStoredJobs([]);
    setSelectedJobIndex(null);
    setFormData({
      name: "",
      age: "",
      address: "",
      phone: "",
      shift_time: "",
      experience: "",
      job_title: "",
      salary_expectation: "",
    });
    setAuthFlow({ stage: "ask_phone", phone: "", profileName: null, exists: null });

    // Use the current language from i18n (respects user's preference)
    const currentLang = i18n.language;
    const welcomeMessage = say(
      "Hello. I will help you find a job.",
      "नमस्ते। मैं आपको नौकरी ढूंढने में मदद करूंगा।",
      "नमस्कार. मी तुम्हाला नोकरी शोधण्यात मदत करेन."
    );
    const prompt = getAuthPrompt("ask_phone");
    const fullMessage = `${welcomeMessage} ${prompt}`.trim();
    setMessages((prev) => (prev && prev.length > 0 ? prev : [{ sender: "ai", text: welcomeMessage, prompt }]));
    speak(fullMessage, currentLang);
  }, []);

  useEffect(() => {
    // When user switches language, keep session and just update recognition language.
    if (recognitionRef.current) {
      recognitionRef.current.lang =
        i18n.language === "en"
          ? "en-US"
          : i18n.language === "hi"
            ? "hi-IN"
            : "mr-IN";
    }
    // Update language state to trigger re-renders
    setCurrentLanguage(i18n.language);
    
    // Translate jobs when language changes
    const rawJobs = rawJobsRef.current;
    if (rawJobs && rawJobs.length > 0) {
      setIsTranslating(true);
      translateJobs(server_url, rawJobs, i18n.language)
        .then(translated => {
          setStoredJobs(translated);
          storedJobsRef.current = translated;
          setIsTranslating(false);
        })
        .catch(err => {
          console.error("Translation error:", err);
          // Fallback to raw jobs if translation fails
          setStoredJobs(rawJobs);
          storedJobsRef.current = rawJobs;
          setIsTranslating(false);
        });
    }
  }, [i18n.language, server_url]);

  const fetchProfileAndJobsAfterLogin = async (phone) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token missing");

    let profile = null;
    try {
      const profileRes = await fetch(`${server_url}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      profile = profileRes.ok ? profileData?.profile || null : null;
    } catch (e) {
      console.error("Profile fetch error:", e);
    }

    if (profile) {
      setFormData((prev) => ({
        ...prev,
        ...profile,
        phone: profile.phone || phone || prev.phone,
      }));
      if (profile.name) setUserName(profile.name);

      localStorage.setItem(
        "workerProfile",
        JSON.stringify({
          profileId: profile._id || null,
          name: profile.name,
          age: profile.age,
          address: profile.address,
          phone: profile.phone,
          shift_time: profile.shift_time,
          experience: profile.experience,
          job_title: profile.job_title,
          salary_expectation: profile.salary_expectation,
        })
      );
    }

    const jobsRes = await fetch(`${server_url}/api/jobs/recommended`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jobsData = await jobsRes.json();
    const jobs = jobsRes.ok ? (jobsData.jobs || []) : [];

    // Store raw jobs and translate them
    rawJobsRef.current = jobs;
    const translatedJobs = await translateJobs(server_url, jobs, i18n.language);
    setStoredJobs(translatedJobs);
    setConversationMode(true);
    conversationModeRef.current = true;

    const top3 = (translatedJobs || [])
      .slice(0, 3)
      .map((j) => j.jobName || j.title)
      .filter(Boolean);

    const intro = profile?.name
      ? say(
          `Hello ${profile.name}.`,
          `${profile.name}, नमस्ते।`,
          `${profile.name}, नमस्कार.`
        )
      : say("Hello.", "नमस्ते।", "नमस्कार.");

    const profileMsg = profile
      ? say(
          "Your profile is found. You can ask me anything.",
          "आपकी प्रोफाइल मिल गई है। अब आप जो पूछना है पूछिए।",
          "तुमची प्रोफाईल मिळाली आहे. आता तुम्हाला जे विचारायचे आहे ते विचारा."
        )
      : say(
          "I could not find your profile, but I will still try to show jobs.",
          "आपकी प्रोफाइल नहीं मिली, लेकिन मैं फिर भी नौकरी दिखाने की कोशिश करूंगा।",
          "तुमची प्रोफाईल मिळाली नाही, पण मी तरीही नोकऱ्या दाखवण्याचा प्रयत्न करेन."
        );

    const jobsMsg =
      top3.length > 0
        ? say(
            `I found jobs for you: ${top3.join(", ")}. You can ask me anything about these jobs.`,
            `आपके लिए नौकरियां मिली हैं: ${top3.join(", ")}. आप इन नौकरियों के बारे में कुछ भी पूछ सकते हैं।`,
            `तुमच्यासाठी नोकऱ्या मिळाल्या आहेत: ${top3.join(", ")}. तुम्ही या नोकऱ्यांबद्दल काहीही विचारू शकता.`
          )
        : say(
            "I could not find jobs right now, but you can still ask me questions.",
            "अभी मुझे नौकरी नहीं मिली, लेकिन आप मुझसे सवाल पूछ सकते हैं।",
            "सध्या नोकऱ्या मिळाल्या नाहीत, पण तुम्ही मला प्रश्न विचारू शकता."
          );

    const finalMsg = `${intro} ${profileMsg} ${jobsMsg}`.trim();
    speak(finalMsg, i18n.language);
    setMessages((prev) => [...prev, { sender: "ai", text: finalMsg, prompt: "" }]);
  };

  const handleTranscript = async (text) => {
    if (!text || processingLockRef.current) return;
    processingLockRef.current = true;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    // Voice-first authentication flow
    if (!conversationModeRef.current) {
      const stage = authFlowRef.current.stage;
      const lang = i18n.language;

      if (stage === "ask_phone") {
        const phone = normalizePhoneClient(text);
        if (!phone) {
          const retry = say(
            "Please say a valid 10-digit mobile number.",
            "कृपया सही 10 अंकों का मोबाइल नंबर बोलिए।",
            "कृपया योग्य 10 अंकी मोबाइल नंबर सांगा."
          );
          speak(retry, lang);
          setMessages((prev) => [...prev, { sender: "ai", text: retry, prompt: "" }]);
          processingLockRef.current = false;
          return;
        }

        setAuthFlow((p) => ({ ...p, stage: "loading", phone }));
        setFormData((prev) => ({ ...prev, phone }));

        try {
          const res = await fetch(`${server_url}/api/auth/check-phone`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Check failed");

          if (data.exists) {
            setAuthFlow({ stage: "ask_pin", phone, profileName: data.profileName || null, exists: true });
            const msg = getAuthPrompt("ask_pin", data.profileName || null);
            speak(msg, lang);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
          } else {
            setAuthFlow({ stage: "collect_profile", phone, profileName: null, exists: false });
            currentFieldIndexRef.current = 0;
            setCurrentFieldIndex(0);

            const msg = say(
              "New number. I will ask a few questions to create your profile.",
              "यह नया नंबर है। मैं आपकी प्रोफाइल बनाने के लिए कुछ सवाल पूछूंगा।",
              "हा नवीन नंबर आहे. तुमची प्रोफाईल तयार करण्यासाठी मी काही प्रश्न विचारतो."
            );
            const firstField = getCurrentField();
            const prompt = getFieldPrompt(firstField, lang);
            speak(`${msg} ${prompt}`.trim(), lang);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt }]);
          }
        } catch (e) {
          const msg = say(
            `Sorry, I could not check your number. ${e.message}`,
            `माफ़ कीजिए, मैं नंबर चेक नहीं कर पाया। ${e.message}`,
            `माफ करा, नंबर तपासता आला नाही. ${e.message}`
          );
          setAuthFlow({ stage: "ask_phone", phone: "", profileName: null, exists: null });
          speak(msg, lang);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: getAuthPrompt("ask_phone") }]);
        } finally {
          processingLockRef.current = false;
        }
        return;
      }

      if (stage === "ask_pin") {
        const pin = parsePinFromSpeech(text);
        if (!pin) {
          const retry = say(
            "Please say your 4-digit PIN again.",
            "कृपया अपना 4 अंकों का PIN फिर से बोलिए।",
            "कृपया तुमचा 4 अंकी PIN पुन्हा सांगा."
          );
          speak(retry, lang);
          setMessages((prev) => [...prev, { sender: "ai", text: retry, prompt: "" }]);
          processingLockRef.current = false;
          return;
        }

        setAuthFlow((p) => ({ ...p, stage: "loading" }));
        try {
          await authLogin({ phone: authFlowRef.current.phone, pin });

          // If profile is missing, fall back to collecting it
          const token = localStorage.getItem("token");
          let profile = null;
          if (token) {
            const profileRes = await fetch(`${server_url}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const profileData = await profileRes.json();
            profile = profileRes.ok ? profileData?.profile || null : null;
          }

          if (!profile) {
            setAuthFlow((p) => ({ ...p, stage: "collect_profile" }));
            currentFieldIndexRef.current = 0;
            setCurrentFieldIndex(0);
            setFormData((prev) => ({ ...prev, phone: authFlowRef.current.phone }));

            const msg = say(
              "I could not find your profile. I will ask a few questions.",
              "आपकी प्रोफाइल नहीं मिली। मैं कुछ सवाल पूछूंगा।",
              "तुमची प्रोफाईल सापडली नाही. मी काही प्रश्न विचारतो."
            );
            const prompt = getFieldPrompt(getCurrentField(), lang);
            speak(`${msg} ${prompt}`.trim(), lang);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt }]);
            processingLockRef.current = false;
            return;
          }

          setAuthFlow((p) => ({ ...p, stage: "loading" }));
          await fetchProfileAndJobsAfterLogin(authFlowRef.current.phone);
        } catch (e) {
          const msg = say(
            "Wrong PIN. Please try again.",
            "PIN गलत है। कृपया फिर से बोलिए।",
            "PIN चुकीचा आहे. कृपया पुन्हा सांगा."
          );
          setAuthFlow((p) => ({ ...p, stage: "ask_pin" }));
          speak(msg, lang);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
        } finally {
          processingLockRef.current = false;
        }
        return;
      }
    }

    // Check if in conversation mode
    if (conversationModeRef.current) {
      try {
        const jobsNow = storedJobsRef.current;

        if (isLocationJobsRequest(text)) {
          const city = extractCityFromQuestion(text);
          if (!city) {
            const msg = say(
              "Please tell the city name (for example: Pune).",
              "कृपया शहर का नाम बोलिए (जैसे: पुणे)।",
              "कृपया शहराचे नाव सांगा (उदा.: पुणे)."
            );
            speak(msg, i18n.language);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
            processingLockRef.current = false;
            return;
          }

          const category = extractCategoryFromQuestion(text);
          let jobsForCity = [];
          let rawJobsForCity = [];
          try {
            rawJobsForCity = await searchJobsFromServer({ location: city, category, limit: 10 });
            // Translate the fetched jobs
            jobsForCity = await translateJobs(server_url, rawJobsForCity, i18n.language);
          } catch {
            rawJobsForCity = (jobsNow || []).filter((j) =>
              normalizeText(j?.location).includes(normalizeText(city))
            );
            jobsForCity = rawJobsForCity;
          }

          if (Array.isArray(jobsForCity) && jobsForCity.length > 0) {
            rawJobsRef.current = rawJobsForCity; // Store raw for future translations
            setStoredJobs(jobsForCity);
            storedJobsRef.current = jobsForCity;
            setSelectedJobIndex(null);
          }

          const msg =
            jobsForCity.length > 0
              ? [
                  say(
                    category ? `Jobs in ${city} for ${category}:` : `Jobs in ${city}:`,
                    `${city === "pune" ? "पुणे" : city} में ये नौकरियां हैं:`,
                    `${city === "pune" ? "पुणे" : city} मध्ये या नोकऱ्या आहेत:`
                  ),
                  ...jobsForCity.slice(0, 5).map((j, idx) => formatJobShort(j, idx)),
                  say(
                    "Say the job number to hear full details.",
                    "पूरी डिटेल के लिए नौकरी नंबर बोलिए।",
                    "सविस्तर माहितीसाठी नोकरी क्रमांक सांगा."
                  ),
                ].join(" ")
              : say(
                  `I did not find jobs for ${city} right now.`,
                  `${city === "pune" ? "पुणे" : city} के लिए अभी मेरे पास सेव की हुई नौकरी नहीं है।`,
                  `${city === "pune" ? "पुणे" : city} साठी सध्या माझ्याकडे सेव केलेल्या नोकऱ्या नाहीत.`
                );

          speak(msg, i18n.language);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
          processingLockRef.current = false;
          return;
        }

        // Local (deterministic) handling for common commands
        if (isShowJobsRequest(text)) {
          const category = extractCategoryFromQuestion(text);
          if (category && /job|jobs|नौकरी|नोकरी|जॉब/i.test(text)) {
            try {
              const jobsByCategory = await searchJobsFromServer({ category, limit: 10 });
              if (jobsByCategory.length > 0) {
                // Translate the fetched jobs
                const translatedJobs = await translateJobs(server_url, jobsByCategory, i18n.language);
                rawJobsRef.current = jobsByCategory; // Store raw for future translations
                setStoredJobs(translatedJobs);
                storedJobsRef.current = translatedJobs;
                setSelectedJobIndex(null);

                const msg =
                  jobsByCategory.length > 0
                    ? [
                        say(
                          `Here are ${category} jobs:`,
                          `${category} की नौकरियां:`,
                          `${category} च्या नोकऱ्या:`
                        ),
                        ...jobsByCategory.slice(0, 5).map((j, idx) => formatJobShort(j, idx)),
                        say(
                          "Say the job number to hear full details.",
                          "पूरी डिटेल के लिए नौकरी नंबर बोलिए।",
                          "सविस्तर माहितीसाठी नोकरी क्रमांक सांगा."
                        ),
                      ].join(" ")
                    : say(
                        "I don't have jobs saved right now.",
                        "अभी मेरे पास सेव की हुई नौकरियां नहीं हैं।",
                        "सध्या माझ्याकडे सेव केलेल्या नोकऱ्या नाहीत."
                      );

                speak(msg, i18n.language);
                setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
                processingLockRef.current = false;
                return;
              }
            } catch {
              // ignore and fall back to local list
            }
          }

          const top = (jobsNow || []).slice(0, 5);
          const msg =
            top.length > 0
              ? [
                  say(
                    "Here are your recommended jobs:",
                    "यह आपकी रिकमेंड की हुई नौकरियां हैं:",
                    "या तुमच्यासाठी रिकमेंड केलेल्या नोकऱ्या आहेत:"
                  ),
                  ...top.map((j, idx) => formatJobShort(j, idx)),
                  say(
                    "Say the job number to hear full details.",
                    "पूरी डिटेल के लिए नौकरी नंबर बोलिए।",
                    "सविस्तर माहितीसाठी नोकरी क्रमांक सांगा."
                  ),
                ].join(" ")
              : say(
                  "I don't have jobs saved right now.",
                  "अभी मेरे पास सेव की हुई नौकरियां नहीं हैं।",
                  "सध्या माझ्याकडे सेव केलेल्या नोकऱ्या नाहीत."
                );

          speak(msg, i18n.language);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
          processingLockRef.current = false;
          return;
        }

        if (isJobDetailsRequest(text)) {
          const num = parseJobNumberFromQuestion(text);
          if (num && jobsNow?.[num - 1]) {
            const msg = formatJobDetails(jobsNow[num - 1], num - 1);
            speak(msg, i18n.language);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
            processingLockRef.current = false;
            return;
          }

          // Try matching by title keywords
          const qNorm = normalizeText(text);
          const matches = (jobsNow || [])
            .map((job, idx) => ({ job, idx, title: normalizeText(job?.jobName || job?.title || job?.jobTitle) }))
            .filter((x) => x.title && (qNorm.includes(x.title) || x.title.includes(qNorm)))
            .slice(0, 3);

          if (matches.length === 1) {
            const msg = formatJobDetails(matches[0].job, matches[0].idx);
            speak(msg, i18n.language);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
            processingLockRef.current = false;
            return;
          }

          if (matches.length > 1) {
            const msg = [
              say(
                "I found multiple matching jobs. Please say the job number:",
                "मुझे कई मिलती-जुलती नौकरियां मिलीं। कृपया नौकरी नंबर बोलिए:",
                "मला अनेक जुळणाऱ्या नोकऱ्या मिळाल्या. कृपया नोकरी क्रमांक सांगा:"
              ),
              ...matches.map((m) => formatJobShort(m.job, m.idx)),
            ].join(" ");
            speak(msg, i18n.language);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
            processingLockRef.current = false;
            return;
          }
        }

        // "Any one <type> job info" requests (avoid LLM hallucination)
        if (isAnyOneJobInfoRequest(text)) {
          const keyword = detectJobKeyword(text);
          let match = null;

          if (keyword) {
            const k = keyword;
            match = (jobsNow || [])
              .map((job, idx) => ({ job, idx }))
              .find(({ job }) => {
                const title = normalizeText(job?.jobName || job?.title || job?.jobTitle);
                const category = normalizeText(job?.category);
                return title.includes(normalizeText(k)) || category.includes(normalizeText(k));
              });
          }

          if (!match && (jobsNow || []).length > 0) {
            match = { job: jobsNow[0], idx: 0 };
          }

          const msg = match
            ? formatJobDetails(match.job, match.idx)
            : say(
                "I don't have jobs saved right now.",
                "अभी मेरे पास सेव की हुई नौकरियां नहीं हैं।",
                "सध्या माझ्याकडे सेव केलेल्या नोकऱ्या नाहीत."
              );

          speak(msg, i18n.language);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
          processingLockRef.current = false;
          return;
        }

        if (isContactRequest(text)) {
          const callIntent = /\bcall\b|call\s+lagao|कॉल\s*लगा|कॉल\s*कर|फोन\s*लगा|call\s*karo|dial/i.test(text);
          const num = parseJobNumberFromQuestion(text);
          let job = null;
          let idx = null;

          if (num && jobsNow?.[num - 1]) {
            job = jobsNow[num - 1];
            idx = num - 1;
          } else {
            const keyword = detectJobKeyword(text);
            if (keyword) {
              const hit = (jobsNow || [])
                .map((j, i) => ({ j, i }))
                .find(({ j }) => {
                  const title = normalizeText(j?.jobName || j?.title || j?.jobTitle);
                  const category = normalizeText(j?.category);
                  return title.includes(normalizeText(keyword)) || category.includes(normalizeText(keyword));
                });
              if (hit) {
                job = hit.j;
                idx = hit.i;
              }
            }
          }

          if (!job) {
            const msg = say(
              "Please tell the job number to get contact details.",
              "कॉन्टैक्ट डिटेल के लिए कृपया नौकरी नंबर बोलिए।",
              "काँटॅक्ट माहितीसाठी कृपया नोकरी क्रमांक सांगा."
            );
            speak(msg, i18n.language);
            setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
            processingLockRef.current = false;
            return;
          }

          const phone = getJobContactPhone(job);
          const title = job?.jobName || job?.title || job?.jobTitle || "";

          if (typeof idx === "number") {
            setSelectedJobIndex(idx);
          }

          const msg = phone
            ? say(
                callIntent
                  ? `I selected Job ${idx + 1} (${title}). Tap the call button to call ${phone}.`
                  : `Job ${idx + 1} (${title}) contact number is ${phone}.`,
                callIntent
                  ? `मैंने नौकरी ${idx + 1} (${title}) चुन ली है। कॉल करने के लिए कॉल बटन दबाएं: ${phone}.`
                  : `नौकरी ${idx + 1} (${title}) का कॉन्टैक्ट नंबर है: ${phone}.`,
                callIntent
                  ? `मी नोकरी ${idx + 1} (${title}) निवडली आहे. कॉल करण्यासाठी कॉल बटन दाबा: ${phone}.`
                  : `नोकरी ${idx + 1} (${title}) साठी संपर्क क्रमांक आहे: ${phone}.`
              )
            : say(
                `Job ${idx + 1} (${title}) contact number is not available. You can apply from the app.`,
                `नौकरी ${idx + 1} (${title}) का कॉन्टैक्ट नंबर उपलब्ध नहीं है। आप ऐप से अप्लाई कर सकते हैं।`,
                `नोकरी ${idx + 1} (${title}) साठी संपर्क क्रमांक उपलब्ध नाही. तुम्ही ॲपमधून अर्ज करू शकता.`
              );

          speak(msg, i18n.language);
          setMessages((prev) => [...prev, { sender: "ai", text: msg, prompt: "" }]);
          processingLockRef.current = false;
          return;
        }

        // Call backend to answer based on stored jobs
        const res = await axios.post(`${server_url}/api/voice/answer-job-question`, {
          question: text,
          jobs: jobsNow,
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

        if (currentFieldIndexRef.current + 1 < profileFlowOrder.length) {
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
          // All fields filled - create account (if needed), create profile, then fetch jobs
          try {
            const finalData = {
              ...formDataRef.current,
              [field]: value,
            };

            const phone = authFlowRef.current.phone || finalData.phone;
            if (!phone) throw new Error("Phone number missing");

            // If this was a NEW user flow, ALWAYS create account now and auto-login
            if (authFlowRef.current.exists === false) {
              clearAssistantSession();
              const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
              await authRegister({ phone, pin: generatedPin });
              await authLogin({ phone, pin: generatedPin });

              const pinMsg = say(
                `Your PIN is ${generatedPin}. Please save it for next time.`,
                `आपका PIN है ${generatedPin}. कृपया इसे अगली बार के लिए याद रखें।`,
                `तुमचा PIN आहे ${generatedPin}. पुढच्या वेळेसाठी लक्षात ठेवा.`
              );
              speak(pinMsg, lang);
              setMessages((prev) => [...prev, { sender: "ai", text: pinMsg, prompt: "" }]);
            }

            const token = localStorage.getItem("token");
            if (!token) throw new Error("Login failed");

            await axios.post(`${server_url}/api/auth/create-profile`, { ...finalData, phone }, {
              headers: { Authorization: `Bearer ${token}` },
            });

            await fetchProfileAndJobsAfterLogin(phone);
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

            if (currentFieldIndexRef.current + 1 < profileFlowOrder.length) {
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

          if (currentFieldIndexRef.current + 1 < profileFlowOrder.length) {
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

          {conversationMode && storedJobs?.length > 0 && (
            <div className="side-section">
              <h3 className="side-title">
                {t("assistantPage.recommendations.title", { defaultValue: "Recommended Jobs" })}
              </h3>
              <div className="job-cards">
                {storedJobs.slice(0, 10).map((job, idx) => {
                  const title = job?.jobName || job?.title || job?.jobTitle;
                  const company = job?.company || job?.companyName;
                  const salary = job?.salary;
                  const location = job?.location;
                  const shift = job?.availability || job?.shift_time;
                  const exp = job?.experience || job?.experience_required;
                  const minAge = job?.minAge;
                  const skills = Array.isArray(job?.skillsRequired) ? job.skillsRequired : [];
                  const desc = job?.jobDescription || job?.description;
                  const contactPhone = getJobContactPhone(job);

                  const isSelected = selectedJobIndex === idx;

                  return (
                    <div
                      className={`job-card${isSelected ? " selected" : ""}`}
                      key={job?._id || idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedJobIndex(idx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedJobIndex(idx);
                      }}
                    >
                      <div className="job-card-header">
                        <div className="job-card-title">
                          {idx + 1}. {title || ""}
                        </div>
                        {company && <div className="job-card-sub">{company}</div>}
                      </div>

                      <div className="job-card-meta">
                        {salary && <span className="job-chip">{salary}</span>}
                        {location && <span className="job-chip">{location}</span>}
                        {shift && <span className="job-chip">{shift}</span>}
                        {exp && <span className="job-chip">{t("assistantPage.recommendations.experience", { defaultValue: "Exp" })}: {exp}</span>}
                        {minAge && <span className="job-chip">{t("assistantPage.recommendations.minAge", { defaultValue: "Min age" })}: {minAge}</span>}
                      </div>

                      {skills.length > 0 && (
                        <div className="job-card-row">
                          <div className="job-card-label">{t("assistantPage.recommendations.skills", { defaultValue: "Skills" })}:</div>
                          <div className="job-card-value">{skills.join(", ")}</div>
                        </div>
                      )}

                      <div className="job-card-row">
                        <div className="job-card-label">{t("assistantPage.recommendations.contact", { defaultValue: "Contact" })}:</div>
                        <div className="job-card-value">
                          {contactPhone || t("assistantPage.recommendations.notAvailable", { defaultValue: "Not available" })}
                        </div>
                      </div>

                      {contactPhone ? (
                        <div className="job-card-actions">
                          <a className="job-call-btn" href={`tel:${String(contactPhone).replace(/\s+/g, "")}`}>
                            {t("assistantPage.recommendations.callButton", { defaultValue: "Call" })}
                          </a>
                        </div>
                      ) : null}

                      {desc && <div className="job-card-desc">{desc}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AiAssistantPage;
