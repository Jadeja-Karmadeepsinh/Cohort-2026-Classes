import { useEffect, useState } from 'react';
import './App.css';
import VideoCard from './components/VideoCard.tsx';

type Video = {
  items: {
    id: string;
    snippet: {
      title: string;
      publishedAt: string;
      channelTitle: string;
      thumbnails: {
        maxres?: {
          url: string;
        };
        high: {
          url: string;
        };
      };
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  };
};

function App() {
  const [res, setRes] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          'https://api.freeapi.app/api/v1/public/youtube/videos',
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const result = await response.json();

        setRes(result.data.data);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="youtube-app">

      {/* HEADER */}
      <header className="header">

        <div className="header-left">
          <button className="icon-button" aria-label="Menu">
            ☰
          </button>

          <div className="youtube-logo">
            <span className="youtube-icon">▶</span>
            <span>YouTube</span>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search"
          />

          <button className="search-button">
            🔍
          </button>
        </div>

        <div className="header-right">
          <button className="header-icon" aria-label="Create">
            ＋
          </button>

          <button className="header-icon" aria-label="Notifications">
            🔔
          </button>

          <div className="profile">
            K
          </div>
        </div>

      </header>


      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* CATEGORY CHIPS */}
        <div className="categories">
          <button className="category active">All</button>
          <button className="category">Programming</button>
          <button className="category">JavaScript</button>
          <button className="category">React</button>
          <button className="category">Web Development</button>
          <button className="category">Technology</button>
          <button className="category">Appwrite</button>
          <button className="category">Next.js</button>
        </div>


        {/* LOADING */}
        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading videos...</p>
          </div>
        )}


        {/* ERROR */}
        {!loading && error && (
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>Unable to load videos. Please refresh the page.</p>
          </div>
        )}


        {/* VIDEO GRID */}
        {!loading && !error && (
          <section className="video-grid">

            {res.map((video) => (
              <VideoCard
                key={video.items.id}
                videoTitle={video.items.snippet.title}
                videoThumbnail={
                  video.items.snippet.thumbnails.maxres?.url ??
                  video.items.snippet.thumbnails.high.url
                }
                videoDuration={video.items.contentDetails.duration}
                chanelName={video.items.snippet.channelTitle}
                videoViews={video.items.statistics.viewCount}
                videoDate={video.items.snippet.publishedAt}
              />
            ))}

          </section>
        )}

      </main>

    </div>
  );
}

export default App;