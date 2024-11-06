import React, { FC, useState, useEffect } from 'react';
import Player from 'react-player';
import { Card } from 'react-bootstrap';
import axios from 'axios';
import { GiAmericanFootballHelmet } from 'react-icons/gi';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';

export enum ContentType {
    TEXT = 'text',
    VIDEO = 'video',
    PDF = 'pdf',
    AUDIO = 'audio',
}

export interface PostsEntity {
    id: number;
    author: string;
    title: string;
    type: ContentType;
    content: string;
    contentLink: string;
    upvotes: number;
    createdAt: Date;
}

interface PostDisplayProps {
    post: PostsEntity;
}

const PostDisplay: FC<PostDisplayProps> = ({ post }) => {
    const [upvotes, setUpvotes] = useState(post.upvotes);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (post.type === ContentType.VIDEO && post.contentLink.includes('proxy')) {
            // Fetch the embed URL if the contentLink contains 'proxy'
            axios.get(post.contentLink)
                .then(response => {
                    if (response.data.embedUrl) {
                        setEmbedUrl(response.data.embedUrl);
                    } else {
                        console.error('Invalid response structure, missing embedUrl');
                    }
                })
                .catch(error => {
                    console.error('Error fetching video embed URL:', error);
                });
        }
    }, [post.type, post.contentLink]);

    const formatDate = (date: Date) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    };

    const handleUpvote = async () => {
        setUpvotes(prevUpvotes => prevUpvotes + 1);
        await axios.post(`${process.env.API_URL}/api/posts/upvote/${post.id}`);
    };

    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                {post.type === ContentType.TEXT && (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ node, ...props }) => (
                                <h1 style={{ color: 'hotpink', fontSize: '100%' }} {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2 style={{ color: 'hotpink', fontSize: '90%' }} {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 style={{ color: 'hotpink', fontSize: '80%' }} {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                                <h4 style={{ color: 'hotpink', fontSize: '80%' }} {...props} />
                            ),
                            h5: ({ node, ...props }) => (
                                <h5 style={{ color: 'hotpink', fontSize: '80%' }} {...props} />
                            ),
                            h6: ({ node, ...props }) => (
                                <h6 style={{ color: 'hotpink', fontSize: '80%' }} {...props} />
                            ),
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                )}
                {post.type === ContentType.VIDEO && post.contentLink.includes('proxy') && embedUrl && (
                    // Render the iframe for the new proxy-based links
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height="480px"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="Video Player"
                    ></iframe>
                )}
                {post.type === ContentType.VIDEO && !post.contentLink.includes('proxy') && (
                    // Render the old react-player for the original content links
                    <Player url={post.contentLink} controls playing={false} playsinline width="100%" height="auto" />
                )}
                {post.type === ContentType.AUDIO && (
                    <audio controls src={post.contentLink}>
                        Your browser does not support the audio element.
                    </audio>
                )}
                {post.type === ContentType.PDF && (
                    <>
                        <Card.Text>{post.content}</Card.Text>
                        <a href={post.contentLink} download className="btn btn-primary">
                            Download PDF
                        </a>
                    </>
                )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                    Posted by {post.author} at {formatDate(new Date(post.createdAt))}
                </small>
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-link hover-grow"
                        onClick={handleUpvote}
                        style={{ color: 'pink' }}
                    >
                        <GiAmericanFootballHelmet color="hotpink" size="28.8" />
                    </button>
                    <small style={{ color: 'hotpink' }}>
                        {upvotes}
                    </small>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default PostDisplay;
