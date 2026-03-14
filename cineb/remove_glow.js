const fs = require('fs');
const glob = require('glob');

const files = [
    'src/pages/Home.jsx',
    'src/pages/Search.jsx',
    'src/pages/MangaDetails.jsx',
    'src/pages/Auth.jsx',
    'src/pages/Watch.jsx',
    'src/pages/MangaReader.jsx',
    'src/pages/Manga.jsx',
    'src/components/Navbar.jsx',
    'src/components/Sidebar.jsx',
    'src/components/MovieCard.jsx',
    'src/index.css'
];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    let newContent = content
        .replace(/\btext-glow-green\b/g, '')
        .replace(/\btext-glow-purple\b/g, '')
        .replace(/\bbg-glow-green\b/g, '')
        .replace(/\bbg-glow-purple\b/g, '')
    // Also remove the explicit Neon green and purple words like "Sector Concluded", "Neural Feed Blocked" if we want to revert cyberpunk, wait, maybe just the classes and colors.
    // The user just said "the idea of green and purple ui was not good make it how it was before". 
    // Which means they just want the colors back.
    fs.writeFileSync(file, newContent, 'utf-8');
});

console.log('Removed glow classes');
