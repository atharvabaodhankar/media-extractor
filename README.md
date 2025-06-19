# 🕸️ Media Extractor

A web app built with **React** and **Node.js** that extracts and displays **all media** (images, videos, audio, and iframes) from any public webpage URL. Users can preview and download the extracted media directly.

---

## 🚀 Features

- 🔍 Extracts:
  - ✅ Images (`<img>`, background styles)
  - ✅ Videos (`<video>`, `<source>`)
  - ✅ Audio (`<audio>`, `.mp3`, `.wav`)
  - ✅ Iframes (for embedded previews)
- ⚡ Instant preview
- ⬇️ One-click media download
- 🧠 Smart handling of relative and absolute URLs
- 🎨 Modern responsive UI with Tailwind CSS


## 🧱 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Axios + Cheerio



## 🛠️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/media-extractor.git
cd media-extractor
````

### 2. Start the Backend

```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### 3. Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
# Runs on http://localhost:5173
```



## 📦 API Reference

**POST** `/api/extract`

| Field | Type   | Description         |
| ----- | ------ | ------------------- |
| url   | string | Full page URL input |

**Response**:

```json
{
  "media": [
    { "type": "image", "src": "https://..." },
    { "type": "video", "src": "https://..." },
    { "type": "audio", "src": "https://..." },
    { "type": "iframe", "src": "https://..." }
  ]
}
```

---

## ⚠️ Legal & Ethical Use

This tool is intended for educational and personal use. Always respect:

* 📜 Copyright and licensing terms
* 🔒 Website policies (robots.txt, TOS)
* 🚫 Do **not** use it on private, copyrighted, or login-gated content

---

## 🤝 Contributing

Pull requests, feature ideas, and issues are welcome!
Feel free to fork and enhance.

---

## 📄 License

MIT License

---

## 💡 Future Improvements

* [ ] Filter by media type
* [ ] Display file size and resolution
* [ ] Preview embedded PDF/documents

---

## ✨ Credits

Made with 💻 by [Atharva](https://github.com/atharvabaodhankar)

