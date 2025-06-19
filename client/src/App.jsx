import { useState } from 'react';
import axios from 'axios';

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
      alert('Failed to fetch media');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">🕸️ Media Extractor</h1>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a website URL..."
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleExtract}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Extracting...' : 'Extract Media'}
        </button>

        {media.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Found {media.length} media file(s):</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item, i) => (
                <div key={i} className="border rounded-lg overflow-hidden shadow">
                  {item.type === 'image' ? (
                    <img src={item.src} alt="" className="w-full h-auto" />
                  ) : (
                    <video src={item.src} controls className="w-full" />
                  )}
                  <a
                    href={item.src}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-500 hover:underline text-sm text-center py-2"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
