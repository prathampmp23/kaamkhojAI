require("dotenv").config();
const fetch = require("node-fetch");

const BASE_URL = "http://localhost:5000/api/voice"; 
// ✅ Update according to your server route prefix

// ✅ Test Cases for Different Fields + Languages
const testCases = [
  // ✅ NAME Tests
  {
    fieldType: "name",
    text: "मेरा नाम विकास पाटील है",
    expected: "Vikas Patil",
  },
  {
    fieldType: "name",
    text: "my name is Rahul Sharma",
    expected: "Rahul Sharma",
  },
  {
    fieldType: "name",
    text: "माझं नाव प्रथम देशमुख आहे",
    expected: "Pratham Deshmukh",
  },

  // ✅ AGE Tests
  {
    fieldType: "age",
    text: "मैं 25 साल का हूँ",
    expected: 25,
  },
  {
    fieldType: "age",
    text: "I am twenty three years old",
    expected: 23,
  },
  {
    fieldType: "age",
    text: "माझं वय तीस आहे",
    expected: 30,
  },

  // ✅ ADDRESS Tests
  {
    fieldType: "address",
    text: "मैं पुणे में रहता हूँ",
    expected: "Pune",
  },
  {
    fieldType: "address",
    text: "I live in Kothrud Pune",
    expected: "Kothrud Pune",
  },
  {
    fieldType: "address",
    text: "माझा पत्ता वडगाव बुद्रुक आहे",
    expected: "Wadgaon Budruk",
  },

  // ✅ PHONE Tests
  {
    fieldType: "phone",
    text: "मेरा नंबर 98765 43210 है",
    expected: "9876543210",
  },
  {
    fieldType: "phone",
    text: "+91-9766736583",
    expected: "9766736583",
  },

  // ✅ SHIFT TIME Tests
  {
    fieldType: "shift_time",
    text: "मला रात्रीची शिफ्ट पाहिजे",
    expected: "night",
  },
  {
    fieldType: "shift_time",
    text: "दिन की शिफ्ट चाहिए",
    expected: "day",
  },
  {
    fieldType: "shift_time",
    text: "कधीही चालेल मला flexible आहे",
    expected: "flexible",
  },

  // ✅ EXPERIENCE Tests
  {
    fieldType: "experience",
    text: "मुझे 5 साल का अनुभव है",
    expected: 5,
  },
  {
    fieldType: "experience",
    text: "I have three years experience",
    expected: 3,
  },

  // ✅ JOB TITLE Tests
  {
    fieldType: "job_title",
    text: "मैं ड्राइवर हूँ",
    expected: "driver",
  },
  {
    fieldType: "job_title",
    text: "माझं काम स्वयंपाकी आहे",
    expected: "cook",
  },
  {
    fieldType: "job_title",
    text: "सिक्योरिटी गार्ड पाहिजे",
    expected: "security guard",
  },

  // ✅ SALARY Tests
  {
    fieldType: "salary_expectation",
    text: "मुझे बीस हजार रुपये चाहिए",
    expected: 20000,
  },
  {
    fieldType: "salary_expectation",
    text: "fifteen thousand per month",
    expected: 15000,
  },
];

// ✅ Call Backend API
async function runTests() {
  console.log("\n🚀 Running Voice Extraction API Tests...\n");

  for (const test of testCases) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ FIELD: ${test.fieldType}`);
    console.log(`🎤 INPUT: ${test.text}`);

    try {
      const response = await fetch(`${BASE_URL}/validate-with-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldType: test.fieldType,
          text: test.text,
        }),
      });

      const data = await response.json();

      console.log("🤖 AI Output:", data);

      console.log("✅ Expected:", test.expected);
      console.log("✅ Extracted:", data.extractedValue);

      if (String(data.extractedValue) === String(test.expected)) {
        console.log("🎉 PASS ✅");
      } else {
        console.log("❌ FAIL ❌");
      }
    } catch (err) {
      console.error("🔥 Error:", err.message);
    }
  }

  console.log("\n✅ All tests completed.\n");
}

// ✅ Run All Tests
runTests();
