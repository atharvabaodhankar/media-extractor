const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs-extra');
const archiver = require('archiver');
const tmp = require('tmp-promise');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ========== MEDIA EXTRACTION ==========
app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const media = new Set();

    const resolveUrl = (src) => {
      try {
        return new URL(src, url).href;
      } catch {
        return null;
      }
    };

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full) media.add(JSON.stringify({ type: 'image', src: full }));
    });

    $('video, source').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full && /\.(mp4|webm|ogg)$/i.test(full))
        media.add(JSON.stringify({ type: 'video', src: full }));
      if (full && /\.(mp3|wav|aac)$/i.test(full))
        media.add(JSON.stringify({ type: 'audio', src: full }));
    });

    $('audio').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full) media.add(JSON.stringify({ type: 'audio', src: full }));
    });

    $('[style]').each((_, el) => {
      const style = $(el).attr('style');
      const match = style?.match(/url\(["']?(.*?)["']?\)/);
      if (match && match[1]) {
        const full = resolveUrl(match[1]);
        if (full) media.add(JSON.stringify({ type: 'image', src: full }));
      }
    });

    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      const full = resolveUrl(src);
      if (full) media.add(JSON.stringify({ type: 'iframe', src: full }));
    });

    const result = Array.from(media).map((item) => JSON.parse(item));
    res.json({ media: result });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch media from the URL' });
  }
});

// ========== ZIP DOWNLOAD ==========
app.post('/api/download-zip', async (req, res) => {
  const { media } = req.body;
  if (!Array.isArray(media) || media.length === 0) {
    return res.status(400).json({ error: 'No media provided' });
  }

  try {
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    const zipPath = path.join(tmpDir.path, 'media.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.download(zipPath, 'media.zip', async () => {
        await tmpDir.cleanup();
      });
    });

    archive.on('error', err => {
      throw err;
    });

    archive.pipe(output);

    for (const item of media) {
      try {
        const fileName = path.basename(new URL(item.src).pathname) || `file-${Date.now()}`;
        const filePath = path.join(tmpDir.path, fileName);

        const response = await axios.get(item.src, {
          responseType: 'stream',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Accept': '*/*',
          },
        });

        const writer = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          response.data.pipe(writer);
          response.data.on('end', resolve);
          response.data.on('error', reject);
        });

        archive.file(filePath, { name: fileName });
      } catch (err) {
        console.warn(`⚠️ Skipped: ${item.src} (${err.message})`);
        // Continue to next media file
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate zip' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Media extractor backend running at http://localhost:${PORT}`);
});
