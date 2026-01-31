import axios from "axios";

const cache = new Map();

const isMostlyNumeric = (s) => /^\s*[\d\s₹,\-+.]+\s*$/.test(s);

const translateTexts = async (apiUrl, texts, targetLang) => {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  if (!targetLang || targetLang === "en") return texts;

  const out = new Array(texts.length);
  const toTranslate = [];
  const idxs = [];

  for (let i = 0; i < texts.length; i++) {
    const raw = texts[i] == null ? "" : String(texts[i]);
    const key = `${targetLang}|${raw}`;
    const hit = cache.get(key);
    if (hit != null) {
      out[i] = hit;
    } else {
      out[i] = raw;
      toTranslate.push(raw);
      idxs.push(i);
    }
  }

  if (toTranslate.length === 0) return out;

  try {
    const resp = await axios.post(`${apiUrl}/api/translate`, {
      texts: toTranslate,
      targetLang,
    });

    const translated = resp?.data?.translations || [];
    for (let j = 0; j < idxs.length; j++) {
      const idx = idxs[j];
      const raw = toTranslate[j];
      const tr = translated[j] ?? raw;
      out[idx] = tr;
      cache.set(`${targetLang}|${raw}`, tr);
    }
  } catch {
    // Fail-safe: keep original English
  }

  return out;
};

export const translateJobs = async (apiUrl, jobs, targetLang) => {
  if (!Array.isArray(jobs) || jobs.length === 0) return jobs;
  if (!targetLang || targetLang === "en") return jobs;

  const fields = [
    "jobName",
    "company",
    "location",
    "salary",
    "jobDescription",
    "category",
    "experience",
  ];

  const texts = [];
  const meta = [];

  for (let jobIdx = 0; jobIdx < jobs.length; jobIdx++) {
    const job = jobs[jobIdx];
    for (let f = 0; f < fields.length; f++) {
      const field = fields[f];
      const value = job?.[field];
      if (value == null) continue;
      const str = String(value);
      if (!str.trim() || isMostlyNumeric(str)) continue;
      meta.push({ jobIdx, field, textIndex: texts.length });
      texts.push(str);
    }
  }

  if (texts.length === 0) return jobs;

  const translated = await translateTexts(apiUrl, texts, targetLang);
  const cloned = jobs.map((j) => ({ ...j }));

  for (let i = 0; i < meta.length; i++) {
    const { jobIdx, field, textIndex } = meta[i];
    const tr = translated[textIndex];
    if (tr != null) cloned[jobIdx][field] = tr;
  }

  return cloned;
};
