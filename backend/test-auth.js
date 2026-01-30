require("dotenv").config();
const fetch = require("node-fetch");

async function testAuth() {
  const key = process.env.OPENROUTER_API_KEY;

  const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });

  console.log("Status:", res.status);
  console.log(await res.text());
}

testAuth();
