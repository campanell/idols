import { useEffect, useState } from "react";
import videoData from "../data/i4l_publish_test_2025-04-23.json";

const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
const CLOUDFLARE_STREAM_DOMAIN = "customer-wj5hu7dmirmsu74s.cloudflarestream.com";

const VideoPlayer = ({ videoId }) => {
  const videoUrl = `https://${CLOUDFLARE_STREAM_DOMAIN}/${videoId}/iframe?poster=${encodeURIComponent(`https://${CLOUDFLARE_STREAM_DOMAIN}/${videoId}/thumbnails/thumbnail.jpg?time=14s`)}`;
  
  return (
    <iframe
      src={videoUrl}
      className="w-full h-full"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Cloudflare Stream Video Player"
    />
  );
};

export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Filter videos by today's publish date
    const todaysVideos = videoData.filter(
        video => video.publish_date <= today && video.aspect_ratio === "vertical"
      );
    console.log('Today\'s videos:', todaysVideos);
    setVideos(todaysVideos);
  }, []);

  return (
    <main className="p-4 sm:p-6 md:p-8 bg-gray-100 space-y-8">
      <h1 className="text-2xl font-bold text-indigo-800">Today's Music Videos</h1>

      {videos.length === 0 ? (
        <p className="text-gray-600">No videos scheduled for today.</p>
      ) : (
        videos.map((video, index) => {
          console.log('Video ID:', video.video_id);
          return (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl p-4 space-y-4 max-w-xl mx-auto"
            >
              {/* Cloudflare Stream video */}
              <div className="aspect-[9/16] w-full overflow-hidden rounded-md relative">
                <div className="absolute inset-0">
                  <VideoPlayer videoId={video.video_id} />
                </div>
              </div>

              {/* Metadata */}
              <div className="text-sm text-gray-700">
                <div><strong>{video.roster_idol}</strong> </div>
                <div><strong>Title:</strong> {video.song_title}</div>
                <div><strong>Publish Date:</strong> {video.publish_date}</div>
              </div>
            </div>
          );
        })
      )}
    </main>
  );
}
