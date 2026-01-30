require("dotenv").config();
const fetch = require("node-fetch");

const BASE_URL = "http://localhost:5000/api/voice"; 
// ✅ Change if your route differs

// ✅ HARD REAL VOICE INPUT TEST CASES (Hindi + Marathi)
const hardTestCases = [

  // ✅ NAME (Hard)
  {
    fieldType: "name",
    text: "अरे मेरा नाम राहुल है जी",
    expected: "Rahul"
  },
  {
    fieldType: "name",
    text: "मैं हूँ प्रशांत देशमुख बोल रहा हूँ",
    expected: "Prashant Deshmukh"
  },
  {
    fieldType: "name",
    text: "लोक मला बाळू म्हणतात",
    expected: "Balu"
  },

  // ✅ AGE (Hard Spoken)
  {
    fieldType: "age",
    text: "मेरी उम्र पच्चीस के आसपास है",
    expected: 25
  },
  {
    fieldType: "age",
    text: "लगभग तीस साल का हूँ",
    expected: 30
  },
  {
    fieldType: "age",
    text: "माझं वय साधारण पंचवीस आहे",
    expected: 25
  },

  // ✅ ADDRESS (Local Style)
  {
    fieldType: "address",
    text: "मैं पुणे के पास रहता हूँ भाई",
    expected: "Pune"
  },
  {
    fieldType: "address",
    text: "मी पुण्यात कोथरूड ला राहतो",
    expected: "Kothrud Pune"
  },
  {
    fieldType: "address",
    text: "माझं गाव अमरावती आहे",
    expected: "Amravati"
  },

  // ✅ PHONE (Messy Digits)
  {
    fieldType: "phone",
    text: "फोन नंबर 98-76-54-32-10 है",
    expected: "9876543210"
  },
  {
    fieldType: "phone",
    text: "माझा नंबर आहे ९७६६७३६५८३",
    expected: "9766736583"
  },

  // ✅ SHIFT TIME (Natural Language)
  {
    fieldType: "shift_time",
    text: "मुझे रात वाली ड्यूटी चाहिए",
    expected: "night"
  },
  {
    fieldType: "shift_time",
    text: "दिवसाची शिफ्ट चालेल",
    expected: "day"
  },
  {
    fieldType: "shift_time",
    text: "कधीही चालेल मला",
    expected: "flexible"
  },

  // ✅ EXPERIENCE (Approximate)
  {
    fieldType: "experience",
    text: "मेरे पास लगभग 4-5 साल का अनुभव है",
    expected: 5
  },
  {
    fieldType: "experience",
    text: "मैं फ्रेशर हूँ भाई",
    expected: 0
  },
  {
    fieldType: "experience",
    text: "माझा तीन वर्षाचा अनुभव आहे",
    expected: 3
  },

  // ✅ JOB TITLE (Real Spoken)
  {
    fieldType: "job_title",
    text: "मी ड्रायव्हिंग करतो",
    expected: "driver"
  },
  {
    fieldType: "job_title",
    text: "मैं चौकीदार हूँ सिक्योरिटी में",
    expected: "security guard"
  },
  {
    fieldType: "job_title",
    text: "मी स्वयंपाकाचं काम करतो",
    expected: "cook"
  },

  // ✅ SALARY (Hardest Field)
  {
    fieldType: "salary_expectation",
    text: "मुझे पंद्रह-सोलह हजार चाहिए",
    expected: 15000
  },
  {
    fieldType: "salary_expectation",
    text: "कम से कम बीस हजार चाहिए",
    expected: 20000
  },
  {
    fieldType: "salary_expectation",
    text: "साधारण पंचवीस हजार",
    expected: 25000
  }
];


// ✅ Run Test Suite
async function runHardTests() {
  console.log("\n🚀 Running HARD Voice Extraction Tests...\n");

  let passed = 0;
  let failed = 0;

  for (const test of hardTestCases) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ FIELD: ${test.fieldType}`);
    console.log(`🎤 INPUT: ${test.text}`);

    try {
      const response = await fetch(`${BASE_URL}/validate-with-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fieldType: test.fieldType,
          text: test.text
        })
      });

      const data = await response.json();

      console.log("🤖 Extracted:", data.extractedValue);
      console.log("✅ Expected :", test.expected);

      if (String(data.extractedValue) === String(test.expected)) {
        console.log("🎉 PASS ✅");
        passed++;
      } else {
        console.log("❌ FAIL ❌");
        failed++;
      }

    } catch (err) {
      console.error("🔥 Error:", err.message);
      failed++;
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ HARD TEST SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Passed:", passed);
  console.log("❌ Failed:", failed);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ✅ Start Tests
runHardTests();
