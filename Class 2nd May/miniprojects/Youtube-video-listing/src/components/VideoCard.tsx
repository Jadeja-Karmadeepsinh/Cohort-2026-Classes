type VideoCardProps = {
  videoTitle: string;
  videoThumbnail: string;
  videoDuration: string;
  chanelName: string;
  videoViews: string;
  videoDate: string;
};


function formatDuration(duration: string) {
  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) {
    return '0:00';
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}


function formatViews(viewCount: string) {
  const views = Number(viewCount);

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }

  return `${views} views`;
}


function formatRelativeDate(date: string) {
  const publishedDate = new Date(date);
  const currentDate = new Date();

  const difference =
    currentDate.getTime() - publishedDate.getTime();

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }

  if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  return 'Just now';
}


function VideoCard({
  videoTitle,
  videoThumbnail,
  videoDuration,
  chanelName,
  videoViews,
  videoDate
}: VideoCardProps) {

  return (
    <article className="video-card">

      {/* THUMBNAIL */}
      <div className="thumbnail-container">

        <img
          src={videoThumbnail}
          alt={videoTitle}
          className="video-thumbnail"
        />

        <span className="duration">
          {formatDuration(videoDuration)}
        </span>

      </div>


      {/* VIDEO INFORMATION */}
      <div className="video-info">

        {/* CHANNEL AVATAR */}
        <div className="channel-avatar">
          {chanelName.charAt(0).toUpperCase()}
        </div>


        {/* TEXT INFORMATION */}
        <div className="video-details">

          <h3 className="video-title">
            {videoTitle}
          </h3>

          <p className="channel-name">
            {chanelName}
          </p>

          <p className="video-meta">
            {formatViews(videoViews)}
            <span className="dot">•</span>
            {formatRelativeDate(videoDate)}
          </p>

        </div>


        {/* THREE DOTS */}
        <button
          className="more-button"
          aria-label="More options"
        >
          ⋮
        </button>

      </div>

    </article>
  );
}

export default VideoCard;