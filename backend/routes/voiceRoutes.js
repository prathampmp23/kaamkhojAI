require("dotenv").config();
const express = require("express");
const router = express.Router();

// Simple multilingual regex-based extractor (keeping as fallback)
function extractField(text, field) {
  const t = (text || "").trim();
  switch (field) {
    case "name": {
      const patterns = [
        /(?:my name is|i am|this is)\s+([a-zA-Z][a-zA-Z\s']{2,})/i,
        /(?:mera naam|मेरा नाम)\s+([\p{L}\s']{2,})/iu,
        /(?:majhe nav|माझे नाव)\s+([\p{L}\s']{2,})/iu,
      ];
      for (const p of patterns) {
        const m = t.match(p);
        if (m) return m[1].trim();
      }
      const words = t.split(/\s+/).filter((w) => /[\p{L}]/u.test(w));
      return words.slice(0, 3).join(" ").trim();
    }
    case "age": {
      const digits = t.replace(/\D/g, "").match(/(\d{1,2})/);
      if (digits) return parseInt(digits[1], 10);
      const numWords = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,
        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90,
      };
      const words = t.toLowerCase().split(/[^a-z]+/);
      let total = 0,
        found = false;
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (numWords[w] !== undefined) {
          found = true;
          if (
            numWords[w] % 10 === 0 &&
            i + 1 < words.length &&
            numWords[words[i + 1]] !== undefined &&
            numWords[words[i + 1]] < 10
          ) {
            total = numWords[w] + numWords[words[i + 1]];
            break;
          } else {
            total = numWords[w];
          }
        }
      }
      if (found) return total;
      const m = t.match(/(\d{1,2})\s*(?:years? old|saal|वर्ष|वय)?/i);
      return m ? parseInt(m[1], 10) : null;
    }
    case "address": {
      const patterns = [
        /(?:i\s*live\s*in|address\s*is|live\s*at)\s+([^\.,\n\r]+[\p{L}\d\s\-]+)/i,
        /(?:mera\s*pata|मेरा\s*पता|पता)\s+([^\.,\n\r]+[\p{L}\d\s\-]+)/iu,
        /(?:majha\s*pata|माझा\s*पत्ता|पत्ता)\s+([^\.,\n\r]+[\p{L}\d\s\-]+)/iu,
      ];
      for (const p of patterns) {
        const m = t.match(p);
        if (m) return m[1].trim();
      }
      const tokens = t.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w));
      return tokens.slice(0, 6).join(" ").trim();
    }
    case "phone": {
      const m = t.replace(/\D/g, "").match(/(\d{10,})/);
      return m ? m[1].slice(0, 10) : null;
    }
    case "shift_time": {
      if (/night|रात|रात्र/i.test(t)) return "night";
      if (/day|दिन|दिवस/i.test(t)) return "day";
      if (/flex|लचीला|लवचिक/i.test(t)) return "flexible";
      return null;
    }
    case "experience": {
      const m = t.match(/(\d{1,2})\s*(?:years?|saal|वर्ष)/i);
      return m ? parseInt(m[1], 10) : null;
    }
    case "skills": {
      // Return short, comma-separated skills/work types
      const cleaned = t
        .replace(/(?:my skills are|skills are|i can|i can do|skill|कौशल|स्किल्स|मैं|मला|मी|कर सकता|करते|करू शकतो|करते|येता)/gi, " ")
        .replace(/[\.|;:]+/g, ",")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleaned) return null;
      // If user spoke a sentence, keep a compact string
      const parts = cleaned
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 6);

      return parts.length ? parts.join(", ") : cleaned;
    }
    case "job_title": {
      const jobs = [
        "driver",
        "cook",
        "chef",
        "security",
        "guard",
        "helper",
        "delivery",
        "electrician",
        "plumber",
        "carpenter",
      ];
      const lower = t.toLowerCase();
      const hit = jobs.find((j) => lower.includes(j));
      if (hit) return hit;
      if (/ड्राइवर|चालक/i.test(t)) return "driver";
      if (/रसोइया|स्वयंपाकी/i.test(t)) return "cook";
      if (/सिक्योरिटी|रक्षक/i.test(t)) return "security";
      return null;
    }
    case "salary_expectation": {
      const m = t.replace(/,/g, "").match(/(\d{4,6})/);
      return m ? parseInt(m[1], 10) : null;
    }
    default:
      return null;
  }
}

router.post("/process", async (req, res) => {
  try {
    const { text, fieldType } = req.body;
    if (!text)
      return res
        .status(400)
        .json({ success: false, message: "text is required" });
    const field = fieldType || "unknown";
    const value = extractField(text, field);
    const confidence = value ? 0.9 : 0.2;
    res.json({ success: !!value, field, extractedValue: value, confidence });
  } catch (e) {
    console.error("Voice process error:", e);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
});

// 🔥 IMPROVED AI VALIDATION WITH META LLAMA 3.3 70B
router.post("/validate-with-ai", async (req, res) => {
  try {
    const { text, fieldType, language } = req.body;
    if (
      fieldType === "experience" &&
      /fresher|फ्रेशर|नया हूँ|नवीन आहे|नवखा/i.test(text)
    ) {
      return res.json({
        success: true,
        extractedValue: 0,
        confidence: "high",
        source: "rule_override",
      });
    }

    const systemPrompt = `
    You are a STRICT data extraction engine.

    Your only task is to extract ONE clean database-ready value for the requested field
    from multilingual voice input (English, Hindi, Marathi).

    ━━━━━━━━━━━━━━━━━━━━━━
    CRITICAL OUTPUT RULES (MANDATORY)
    ━━━━━━━━━━━━━━━━━━━━━━
    1. Return ONLY valid JSON (no markdown, no explanation).
    2. Extract ONLY the requested value — not a full sentence.
    3. Do NOT guess. If unclear or missing → return success:false.
    4. Transliterate Hindi/Marathi script into English.
    5. Remove filler phrases like:
      "मेरा नाम", "माझं नाव", "my name is", "I am", "this is", "मैं हूँ".
    6. Output must contain ONLY the extracted value.

    ━━━━━━━━━━━━━━━━━━━━━━
    FIELD TO EXTRACT
    ━━━━━━━━━━━━━━━━━━━━━━
    Field: ${fieldType}
    User said: "${text}"

    ━━━━━━━━━━━━━━━━━━━━━━
    EXTRACTION RULES (Apply ONLY for this field)
    ━━━━━━━━━━━━━━━━━━━━━━

    name:
    - Extract only the person’s name (max 2–3 words).
    - Remove prefixes: "मेरा नाम", "I am", "this is".
    - Transliterate Hindi/Marathi → English.
    Examples:
    "मेरा नाम प्रथम पाटील" → "Pratham Patil"
    "I am विकास पाटील" → "Vikas Patil"

    age:
    - Extract only integer number (18–100).
    - Convert words to digits (तेईस→23, twenty three→23).
    - Reject words like "साल", "years".
    Example:
    "मैं 25 साल का हूँ" → 25

    address:
    - Extract only locality/city name (max 4 words).
    - Transliterate to English.
    Examples:
    "मैं पुणे में रहता हूँ" → "Pune"
    "वडगाव बुद्रुक" → "Wadgaon Budruk"

    phone:
    - Extract exactly 10 digits only.
    - Remove +91, spaces, dashes.
    - If not exactly 10 digits → fail.
    Example:
    "+91 98765 43210" → "9876543210"

    shift_time:
    - Must be ONLY one value:
      "day", "night", "flexible"
    Mappings:
    दिन/दिवसा → day
    रात/रात्री → night
    लचीला/कधीही → flexible

    experience:
    - Extract only integer years (0–50).
    - "fresher", "फ्रेशर", "नया हूँ", "नवीन आहे" → return 0
    Examples:
    "5 साल अनुभव" → 5
    "three years" → 3

    job_title:
    - Convert job name into standard English only.
    Mappings:
    ड्राइवर/चालक → driver
    रसोइया/स्वयंपाकी → cook
    सिक्योरिटी गार्ड → security guard

    salary_expectation:
    - Extract monthly salary integer only.
    - Convert words:
    "बीस हजार" → 20000
    "fifteen thousand" → 15000
    - Ignore daily wages.

    skills:
    - Extract ONLY a short comma-separated list of skills/work types in English.
    - Max 6 items.
    - Transliterate Hindi/Marathi into English.
    Examples:
    "मुझे ड्राइविंग और डिलिव्हरी आती है" → "driving, delivery"
    "मी साफसफाई, कुकिंग करतो" → "cleaning, cooking"

    ━━━━━━━━━━━━━━━━━━━━━━
    RESPONSE FORMAT (JSON ONLY)
    ━━━━━━━━━━━━━━━━━━━━━━

    If extraction is successful:
    {
      "success": true,
      "value": extracted_value,
      "confidence": "high"
    }

    If extraction fails:
    {
      "success": false,
      "value": null,
      "reason": "missing_or_unclear_input"
    }

    Return ONLY JSON. No extra text.`;

    // Meta Llama 3.3 70B API call via OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
          "X-Title": process.env.YOUR_APP_NAME,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.1, // Low temperature for more consistent extraction
          max_tokens: 500,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Llama API error:", response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.choices[0]?.message?.content || "";

    console.log("Llama Response:", textContent);

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = textContent.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", textContent);
      return res.json({ success: false, extractedValue: null });
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log(" Extracted:", {
      field: fieldType,
      original: text,
      extracted: result.value,
      success: result.success,
    });

    res.json({
      success: result.success,
      extractedValue: result.value || null,
      confidence: result.confidence || "medium",
    });
  } catch (error) {
    console.error("Llama API validation error:", error);

    // Fallback to regex extraction if AI fails
    console.log("⚠️ AI failed, using regex fallback");
    const fallbackValue = extractField(req.body.text, req.body.fieldType);

    res.json({
      success: !!fallbackValue,
      extractedValue: fallbackValue,
      confidence: "low",
    });
  }
});

// New endpoint: Answer job-related questions using stored job data
router.post("/answer-job-question", async (req, res) => {
  try {
    const { question, jobs, language, profile } = req.body;

    if (!question || !jobs) {
      return res.status(400).json({ 
        success: false, 
        answer: "Question and jobs data are required" 
      });
    }

    const langKey = language === "hi" ? "hi" : language === "mr" ? "mr" : "en";

    const t = {
      hi: {
        notSpecified: "उल्लेख नहीं है",
        noSalaryToCompare: "इन नौकरियों में सैलरी का साफ़ जानकारी नहीं है, इसलिए तुलना नहीं कर सकता।",
        lowestSalaryPrefix: "सबसे कम सैलरी वाली नौकरी:",
      },
      mr: {
        notSpecified: "नमूद नाही",
        noSalaryToCompare: "या नोकऱ्यांमध्ये पगाराची स्पष्ट माहिती नाही, म्हणून तुलना करू शकत नाही.",
        lowestSalaryPrefix: "सर्वात कमी पगाराची नोकरी:",
      },
      en: {
        notSpecified: "Not specified",
        noSalaryToCompare: "Salary is not clearly available in these jobs, so I can't compare.",
        lowestSalaryPrefix: "Lowest salary job:",
      },
    };

    const toStr = (v) => (v === null || v === undefined ? "" : String(v));

    const parseMinSalary = (salaryRaw) => {
      const s = toStr(salaryRaw).replace(/,/g, " ");
      if (!s) return null;
      // Extract numbers like 12000, 12 000, 12k
      const kMatch = s.match(/(\d+(?:\.\d+)?)\s*k\b/i);
      if (kMatch) {
        const n = Number(kMatch[1]);
        return Number.isFinite(n) ? Math.round(n * 1000) : null;
      }
      const nums = s.match(/\d{3,6}/g);
      if (!nums || nums.length === 0) return null;
      const values = nums
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n));
      if (values.length === 0) return null;
      return Math.min(...values);
    };

    const isLowestSalaryQuestion = (q) => {
      const lower = toStr(q).toLowerCase();
      return (
        /lowest\s+salary|least\s+salary|min(?:imum)?\s+salary|cheapest\s+job/.test(lower) ||
        /सबसे\s*कम|कम\s*सैलरी|न्यूनतम\s*सैलरी/.test(q) ||
        /सर्वात\s*कमी|कमी\s*पगार|किमान\s*पगार/.test(q)
      );
    };

    if (Array.isArray(jobs) && jobs.length > 0 && isLowestSalaryQuestion(question)) {
      const withParsed = jobs
        .map((job, idx) => ({
          idx,
          job,
          minSalary: parseMinSalary(job?.salary),
        }))
        .filter((x) => x.minSalary !== null);

      if (withParsed.length === 0) {
        return res.json({ success: true, answer: t[langKey].noSalaryToCompare });
      }

      withParsed.sort((a, b) => a.minSalary - b.minSalary);
      const best = withParsed[0];
      const title = best.job?.jobName || best.job?.title || best.job?.jobTitle || t[langKey].notSpecified;
      const company = best.job?.company || best.job?.companyName || t[langKey].notSpecified;
      const loc = best.job?.location || t[langKey].notSpecified;
      const salaryLabel = best.job?.salary || t[langKey].notSpecified;

      const answer =
        langKey === "hi"
          ? `${t.hi.lowestSalaryPrefix} जॉब ${best.idx + 1} (${title}), कंपनी: ${company}, लोकेशन: ${loc}, सैलरी: ${salaryLabel}`
          : langKey === "mr"
            ? `${t.mr.lowestSalaryPrefix} नोकरी ${best.idx + 1} (${title}), कंपनी: ${company}, ठिकाण: ${loc}, पगार: ${salaryLabel}`
            : `${t.en.lowestSalaryPrefix} Job ${best.idx + 1} (${title}), Company: ${company}, Location: ${loc}, Salary: ${salaryLabel}`;

      return res.json({ success: true, answer });
    }

// Create context from jobs data (use correct field names from schema)
const jobsContext = (Array.isArray(jobs) ? jobs : []).map((job, idx) => {
  const title = job.jobName || job.title || job.jobTitle || t[langKey].notSpecified;
  const company = job.company || job.companyName || t[langKey].notSpecified;
  const salary = job.salary || t[langKey].notSpecified;
  const location = job.location || t[langKey].notSpecified;
  const shift = job.availability || job.shift_time || t[langKey].notSpecified;
  const expReq = job.experience || job.experience_required || t[langKey].notSpecified;
  const desc = job.jobDescription || job.description || t[langKey].notSpecified;
  const contactPhone =
    job.contactPhone ||
    job.postedByPhone ||
    job.postedBy?.phone ||
    t[langKey].notSpecified;

  return `Job ${idx + 1}:
- Title: ${title}
- Company: ${company}
- Salary: ${salary}
- Location: ${location}
- Shift/Availability: ${shift}
- Experience Required: ${expReq}
- Contact Phone: ${contactPhone}
- Description: ${desc}`;
}).join("\n\n");


    const langName = language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English";

    const systemPrompt = `You are a helpful voice job assistant for illiterate workers.
Answer questions about jobs using ONLY the provided job data.

User Profile:
- Name: ${profile?.name || ""}
- Job Looking For: ${profile?.job_title || ""}
- Experience: ${profile?.experience ?? ""}
- Salary Expectation: ${profile?.salary_expectation ?? ""}
- Preferred Shift: ${profile?.shift_time || ""}

Available Jobs:
${jobsContext}

Rules:
1. Answer in ${langName}
2. Keep the answer short and easy
3. If user asks about salary/shift/location/company, use exact job details
4. If user asks "best job", recommend based on profile and explain in one line
5. If data is missing for a field, say "not specified" (in the same language)
6. Do NOT invent job details
7. Mention job number when referring to a job
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_APP_NAME || "KaamKhoj",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(question) },
        ],
        temperature: 0.3,
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter answer-job-question error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = (data.choices?.[0]?.message?.content || "").trim() || "I couldn't generate an answer.";

    res.json({
      success: true,
      answer: answer,
    });

  } catch (error) {
    console.error("Job Q&A error:", error);
    
    // Fallback answer
    const fallbackAnswers = {
      hi: "क्षमा करें, मैं अभी आपके सवाल का जवाब नहीं दे पा रहा हूँ। कृपया फिर से कोशिश करें।",
      mr: "माफ करा, मी सध्या तुमच्या प्रश्नाचे उत्तर देऊ शकत नाही. कृपया पुन्हा प्रयत्न करा.",
      en: "Sorry, I couldn't answer your question right now. Please try again."
    };

    res.json({
      success: false,
      answer: fallbackAnswers[req.body.language] || fallbackAnswers.en,
    });
  }
});

module.exports = router;
