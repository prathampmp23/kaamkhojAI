const express = require('express');
const router = express.Router();

// Simple multilingual regex-based extractor
function extractField(text, field) {
  const t = (text || '').trim();
  switch (field) {
    case 'name': {
      // Capture after phrases like "my name is", "mera naam", "मेरा नाम", "माझे नाव"
      const patterns = [
        /(?:my name is|i am|this is)\s+([a-zA-Z][a-zA-Z\s']{2,})/i,
        /(?:mera naam|मेरा नाम)\s+([\p{L}\s']{2,})/iu,
        /(?:majhe nav|माझे नाव)\s+([\p{L}\s']{2,})/iu
      ];
      for (const p of patterns) { const m = t.match(p); if (m) return m[1].trim(); }
      // Fallback: first two words capitalized
      const words = t.split(/\s+/).filter(w => /[\p{L}]/u.test(w));
      return words.slice(0, 3).join(' ').trim();
    }
    case 'age': {
      // Try direct digits
      const digits = t.replace(/\D/g, '').match(/(\d{1,2})/);
      if (digits) return parseInt(digits[1], 10);
      // Try common English words (up to 99)
      const numWords = {
        zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9,
        ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19,
        twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90
      };
      const words = t.toLowerCase().split(/[^a-z]+/);
      let total = 0, found = false;
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (numWords[w] !== undefined) {
          found = true;
          // handle compound like "twenty one"
          if (numWords[w] % 10 === 0 && i+1 < words.length && numWords[words[i+1]] !== undefined && numWords[words[i+1]] < 10) {
            total = numWords[w] + numWords[words[i+1]]; break;
          } else { total = numWords[w]; }
        }
      }
      if (found) return total;
      const m = t.match(/(\d{1,2})\s*(?:years? old|saal|वर्ष|वय)?/i);
      return m ? parseInt(m[1], 10) : null;
    }
    case 'address': {
      const patterns = [
        /(?:i\s*live\s*in|address\s*is|live\s*at)\s+([^\.,\n\r]+[\p{L}\d\s\-]+)/i,
        /(?:mera\s*pata|मेरा\s*पता|पता)\s+([^\.,\n\r]+[\p{L}\d\s\-]+)/iu,
        /(?:majha\s*pata|माझा\s*पत्ता|पत्ता)\s+([^\.,\n\r]+[\p{L}\d\s\-]+)/iu
      ];
      for (const p of patterns) { const m = t.match(p); if (m) return m[1].trim(); }
      // Fallback: try to remove trailing non-address words and keep up to 6 tokens
      const tokens = t.split(/\s+/).filter(w => /[\p{L}\d]/u.test(w));
      return tokens.slice(0, 6).join(' ').trim();
    }
    case 'phone': {
      const m = t.replace(/\D/g, '').match(/(\d{10,})/);
      return m ? m[1].slice(0, 10) : null;
    }
    case 'shift_time': {
      if (/night|रात|रात्र/i.test(t)) return 'night';
      if (/day|दिन|दिवस/i.test(t)) return 'day';
      if (/flex|लचीला|लवचिक/i.test(t)) return 'flexible';
      return null;
    }
    case 'experience': {
      const m = t.match(/(\d{1,2})\s*(?:years?|saal|वर्ष)/i);
      return m ? parseInt(m[1], 10) : null;
    }
    case 'job_title': {
      const jobs = ['driver','cook','chef','security','guard','helper','delivery','electrician','plumber','carpenter'];
      const lower = t.toLowerCase();
      const hit = jobs.find(j => lower.includes(j));
      if (hit) return hit;
      // Hindi/Marathi common
      if (/ड्राइवर|चालक/i.test(t)) return 'driver';
      if (/रसोइया|स्वयंपाकी/i.test(t)) return 'cook';
      if (/सिक्योरिटी|रक्षक/i.test(t)) return 'security';
      return null;
    }
    case 'salary_expectation': {
      const m = t.replace(/,/g,'').match(/(\d{4,6})/);
      return m ? parseInt(m[1], 10) : null;
    }
    default:
      return null;
  }
}

router.post('/process', async (req, res) => {
  try {
    const { text, fieldType } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'text is required' });
    const field = fieldType || 'unknown';
    const value = extractField(text, field);
    const confidence = value ? 0.9 : 0.2;
    res.json({ success: !!value, field, extractedValue: value, confidence });
  } catch (e) {
    console.error('Voice process error:', e);
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
});

module.exports = router;