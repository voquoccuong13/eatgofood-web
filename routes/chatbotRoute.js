const express = require('express');
const router = express.Router();
const { askQuestion } = require('../utils/chatBot');

router.post('/ask', async (req, res) => {
    const { question } = req.body;
    console.log('👉 Câu hỏi nhận từ frontend:', question);

    const { reply, mainProduct, suggestProduct } = await askQuestion(question);

    res.json({
        answer: reply,
        mainProduct,
        suggestProduct,
    });
});

module.exports = router;
