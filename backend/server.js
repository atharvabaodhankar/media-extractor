const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const media = new Set();

    // Helper to resolve relative URLs
    const resolveUrl = (src) => {
      try {
        return new URL(src, url).href;
      } catch {
        return null;
      }
    };

    // Images
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full) media.add(JSON.stringify({ type: 'image', src: full }));
    });

    // Videos and Sources
    $('video, source').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full && /\.(mp4|webm|ogg)$/i.test(full))
        media.add(JSON.stringify({ type: 'video', src: full }));
      if (full && /\.(mp3|wav|aac)$/i.test(full))
        media.add(JSON.stringify({ type: 'audio', src: full }));
    });

    // Audio
    $('audio').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full) media.add(JSON.stringify({ type: 'audio', src: full }));
    });

    // Background images in style attributes
    $('[style]').each((_, el) => {
      const style = $(el).attr('style');
      const match = style?.match(/url\(["']?(.*?)["']?\)/);
      if (match && match[1]) {
        const full = resolveUrl(match[1]);
        if (full) media.add(JSON.stringify({ type: 'image', src: full }));
      }
    });

    // Iframe sources (optional)
    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full) media.add(JSON.stringify({ type: 'iframe', src: full }));
    });

    // Convert Set to array
    const result = Array.from(media).map((item) => JSON.parse(item));
    res.json({ media: result });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch media from the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Media extractor backend running at http://localhost:${PORT}`);
});
