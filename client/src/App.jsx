import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (!url) return alert('Please enter a URL');
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3001/api/extract', { url });
      setMedia(res.data.media);
    } catch (err) {
      alert('Failed to fetch media. See console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🕸️ Media Extractor</h1>
      <input
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
        placeholder="Enter a website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleExtract} disabled={loading}>
        {loading ? 'Extracting...' : 'Extract Media'}
      </button>

      <div style={{ marginTop: 20 }}>
        {media.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {media.map((item, i) => (
              <div key={i} style={{ border: '1px solid #ccc', padding: 10 }}>
                {item.type === 'image' ? (
                  <img src={item.src} alt="" style={{ width: '100%' }} />
                ) : (
                  <video src={item.src} controls style={{ width: '100%' }} />
                )}
                <a href={item.src} download target="_blank" rel="noopener noreferrer">Download</a>
              </div>
            ))}
          </div>
        ) : (
          <p>No media found yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
