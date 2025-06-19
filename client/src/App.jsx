import { useState } from "react";
import axios from "axios";
import fileDownload from "js-file-download";

function App() {
  const [url, setUrl] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const BACKEND = import.meta.env.VITE_BACKEND_URL;

  const handleExtract = async () => {
    if (!url) return alert("Please enter a URL");
    try {
      setLoading(true);
      const res = await axios.post(BACKEND + "/api/extract", { url });
      setMedia(res.data.media);
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to fetch media";
      alert(message);
      console.error("Extract Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleZipDownload = async () => {
    if (!media.length) return;
    try {
      setDownloadingZip(true);
      const res = await axios.post(
        BACKEND + "/api/download-zip",
        { media },
        { responseType: "blob" }
      );
      fileDownload(res.data, "media.zip");
    } catch (err) {
      const message = err?.response?.data?.error || "Zip download failed";
      alert(message);
      console.error("ZIP Error:", err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">
          🕸️ Media Extractor
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            placeholder="Enter a website URL..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />

          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Extract"}
          </button>
        </div>

        {media.length > 0 && (
          <>
            <div className="my-4 text-right">
              <button
                onClick={handleZipDownload}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={downloadingZip}
              >
                {downloadingZip ? "Creating ZIP..." : "⬇️ Download All as .zip"}
              </button>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              Found {media.length} media file{media.length !== 1 && "s"}:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item, i) => (
                <div
                  key={i}
                  className="border rounded-lg overflow-hidden shadow bg-white"
                >
                  {item.type === "image" ? (
                    <img
                      src={item.src}
                      alt=""
                      className="w-full object-cover"
                    />
                  ) : item.type === "video" ? (
                    <video controls src={item.src} className="w-full" />
                  ) : item.type === "audio" ? (
                    <audio controls src={item.src} className="w-full p-2" />
                  ) : item.type === "iframe" ? (
                    <iframe
                      src={item.src}
                      title={`iframe-${i}`}
                      className="w-full h-52 border-0"
                    />
                  ) : null}
                  <div className="p-2 text-center">
                    <a
                      href={item.src}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Download
                    </a>
                  </div>
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
