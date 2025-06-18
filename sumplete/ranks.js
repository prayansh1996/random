const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ranks</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        h1 {
            color: #4a90e2;
            margin-bottom: 20px;
        }
        .content {
            text-align: center;
            max-width: 600px;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        a {
            color: #4a90e2;
            text-decoration: none;
            margin: 10px;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>Ranks Page</h1>
        <p>This is a template page for the ranks functionality.</p>
        <p>Replace this content with your actual ranks implementation.</p>
        <a href="/sumplete">Back to Sumplete</a>
    </div>
</body>
</html>`);
});

module.exports = router;