const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/featured', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'featured.html'));
});

app.get('/entercode', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'entercode.html'));
});

// Handle game upload
app.post('/upload', upload.single('gameFile'), (req, res) => {
    const { originalname, filename } = req.file;
    const { title, icon } = req.body;

    // Move the file to a permanent location
    const newFilePath = path.join(__dirname, 'uploads', originalname);
    fs.renameSync(req.file.path, newFilePath);

    // Save game metadata
    const gamesFile = path.join(__dirname, 'games.json');
    const games = JSON.parse(fs.readFileSync(gamesFile, 'utf-8'));
    games.push({ title, filename: originalname, icon, likes: 0, dislikes: 0 });
    fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));

    res.json({ message: 'Game uploaded successfully!' });
});

// Handle like
app.post('/like/:filename', (req, res) => {
    const gamesFile = path.join(__dirname, 'games.json');
    const games = JSON.parse(fs.readFileSync(gamesFile, 'utf-8'));
    const game = games.find(g => g.filename === req.params.filename);

    if (game) {
        game.likes += 1;
        fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
        res.json({ message: 'Game liked!' });
    } else {
        res.status(404).json({ message: 'Game not found' });
    }
});

// Handle dislike
app.post('/dislike/:filename', (req, res) => {
    const gamesFile = path.join(__dirname, 'games.json');
    const games = JSON.parse(fs.readFileSync(gamesFile, 'utf-8'));
    const game = games.find(g => g.filename === req.params.filename);

    if (game) {
        game.dislikes += 1;
        fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
        res.json({ message: 'Game disliked!' });
    } else {
        res.status(404).json({ message: 'Game not found' });
    }
});

// Serve games metadata
app.get('/games', (req, res) => {
    const gamesFile = path.join(__dirname, 'games.json');
    const games = JSON.parse(fs.readFileSync(gamesFile, 'utf-8'));
    // Sort games based on likes and dislikes
    games.sort((a, b) => b.likes - a.likes);
    res.json(games);
});

// Serve game files
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
