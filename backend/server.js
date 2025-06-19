const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// POST /api/extract
app.post('/api/extract', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const media = [];

    // Extract images
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        media.push({ type: 'image', src: new URL(src, url).href });
      }
    });

    // Extract video sources
    $('video, source').each((_, el) => {
      const src = $(el).attr('src');
      if (src && /\.(mp4|webm|ogg|mp3)$/.test(src)) {
        media.push({ type: 'video', src: new URL(src, url).href });
      }
    });

    res.json({ media });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch media from the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Media extractor backend running at http://localhost:${PORT}`);
});
