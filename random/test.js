const express = require('express');
const app = express();
const PORT = 3000; // Hardcode to 3000 for this test

app.get('/users', (req, res) => {
    console.log("Minimal test server received request for /users");
    res.status(200).send({ message: "Hello from the minimal test server!" });
});

app.listen(PORT, () => {
    console.log(`Minimal test server running on http://localhost:${PORT}`);
});
