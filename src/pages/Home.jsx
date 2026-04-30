import { useEffect, useState } from "react";
import videoData from "../data/i4l_publish.json";
import MembershipCTA from "../components/MembershipCTA";

const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
const CLOUDFLARE_STREAM_DOMAIN = import.meta.env.VITE_CLOUDFLARE_STREAM_DOMAIN;

const VideoPlayer = ({ videoId }) => {
  const videoUrl = `https://${CLOUDFLARE_STREAM_DOMAIN}/${videoId}/iframe?poster=${encodeURIComponent(`https://${CLOUDFLARE_STREAM_DOMAIN}/${videoId}/thumbnails/thumbnail.jpg?time=14s`)}`;
  
  return (
    <iframe
      src={videoUrl}
      className="w-full h-full"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Cloudflare Stream Video Player"
      loading="lazy"
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
      {/* (Removed "Today's Music Videos" as no longer necessary) */}

      {videos.length === 0 ? (
        <p className="text-gray-600">No videos scheduled for today.</p>
      ) : (
        videos.map((video) => {
          console.log('Video ID:', video.video_id);
          return (
            <div
              key={video.video_id}
              className="mx-auto max-w-xl space-y-4 rounded-xl bg-white p-4 shadow-md md:max-w-3xl"
            >
              {/* Cloudflare Stream video */}
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-md">
                <div className="absolute inset-0">
                  <VideoPlayer videoId={video.video_id} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start md:gap-6">
                <div className="min-w-0 text-sm text-gray-700">
                  <div>
                    <strong>{video.roster_idol}</strong>
                  </div>
                  <div>
                    <strong>Title:</strong> {video.song_title}
                  </div>
                  <div>
                    <strong>Publish Date:</strong> {video.publish_date}
                  </div>
                  <div>
                    <strong>Language:</strong> {video.language}
                  </div>
                </div>
                <div className="min-w-0">
                  <MembershipCTA videoId={video.video_id} language="en" />
                </div>
              </div>
            </div>
          );
        })
      )}
    </main>
  );
}
