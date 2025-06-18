const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Determine the base URL based on the request path
    const baseUrl = req.baseUrl.includes('/random') ? '/random' : '';
    res.render('ranks', { baseUrl });
});

module.exports = router;