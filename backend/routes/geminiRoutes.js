const express = require('express');
const { generateResponse } = require('../services/GeminiService');
const router = express.Router();

router.post('/chat', async (req, res) => {
    const { messages, language } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
    }
    const response = await generateResponse(messages, language || 'en-IN');
    res.json({ response });
});

module.exports = router;
