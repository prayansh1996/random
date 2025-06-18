const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.send('Test route works!');
});

app.listen(3001, () => {
    console.log('Test server running on port 3001');
});