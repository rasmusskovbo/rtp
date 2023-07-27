import React from 'react';

interface VideoPlayerProps {
    src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    return (
        <video width="320" height="240" controls>
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}

export default VideoPlayer;
