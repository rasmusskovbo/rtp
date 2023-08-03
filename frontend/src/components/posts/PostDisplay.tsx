import React, {FC, useState} from 'react';
import Player from 'react-player';
import { Card } from 'react-bootstrap';
import axios from 'axios';
import {GiAmericanFootballHelmet} from "react-icons/gi";

export enum ContentType {
    TEXT = "text",
    VIDEO = "video",
    PDF = "pdf"
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

    const formatDate = (date: Date) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    }

    const handleUpvote = async () => {
        setUpvotes(prevUpvotes => prevUpvotes + 1);
        await axios.post(`${process.env.API_URL}/api/posts/upvote/${post.id}`);
    }

    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                {post.type === ContentType.TEXT && (
                    <Card.Text style={{ whiteSpace: 'pre-line' }}>{post.content}</Card.Text>
                )}
                {post.type === ContentType.VIDEO &&
                    <Player url={post.contentLink} controls playing={false} playsinline width="100%" height="auto" />}
                {post.type === ContentType.PDF &&
                    <>
                        <Card.Text>{post.content}</Card.Text>
                        <a href={post.contentLink} download className="btn btn-primary">
                            Download PDF
                        </a>
                    </>
                }
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                    Posted by {post.author} at {formatDate(new Date(post.createdAt))}
                </small>
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-link hover-grow"
                        onClick={handleUpvote}
                        style={{color: 'pink'}}
                    >
                        <GiAmericanFootballHelmet color="hotpink" size="28.8" />
                    </button>
                    <small style={{color: 'hotpink'}}>
                        {upvotes}
                    </small>
                </div>
            </Card.Footer>

        </Card>
    );
};

export default PostDisplay;
