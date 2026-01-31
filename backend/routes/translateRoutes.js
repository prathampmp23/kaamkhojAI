const express = require("express");
const axios = require("axios");

const router = express.Router();

// POST /api/translate
// Body: { texts: string[] | string, targetLang: 'hi'|'mr'|'en', sourceLang?: string }
router.post("/", async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        success: false,
        message: "GOOGLE_TRANSLATE_API_KEY is not configured on server",
      });
    }

    const { texts, targetLang, sourceLang } = req.body || {};

    const target = (targetLang || "en").toLowerCase();
    if (!target || typeof target !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "targetLang is required" });
    }

    const list = Array.isArray(texts) ? texts : typeof texts === "string" ? [texts] : [];

    // Keep output shape stable
    if (list.length === 0) {
      return res.json({ success: true, translations: [] });
    }

    const safeTexts = list.map((t) => (t == null ? "" : String(t)));

    // Short-circuit for English
    if (target === "en") {
      return res.json({ success: true, translations: safeTexts });
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(
      apiKey
    )}`;

    const payload = {
      q: safeTexts,
      target,
      format: "text",
    };
    if (sourceLang) payload.source = String(sourceLang).toLowerCase();

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    const translations =
      response?.data?.data?.translations?.map((t) => t.translatedText) || [];

    return res.json({ success: true, translations });
  } catch (error) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      "Translation failed";

    return res.status(status).json({ success: false, message });
  }
});

module.exports = router;
