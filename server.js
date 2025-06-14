const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve model files from the coralimagemodel directory
app.use('/coralimagemodel', express.static(path.join(__dirname, 'coralimagemodel')));

// Serve the index.html file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Coral Reef Identification System running at http://localhost:${port}`);
});