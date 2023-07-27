import React, { FC } from 'react';
import Player from 'react-player';
import { Card } from 'react-bootstrap';

enum ContentType {
    TEXT = "text",
    VIDEO = "video",
    PDF = "pdf"
}

interface PostsEntity {
    id: number;
    author: string;
    title: string;
    type: ContentType;
    content: string;
    contentLink: string;
    createdAt: Date;
}

interface PostDisplayProps {
    post: PostsEntity;
}

const PostDisplay: FC<PostDisplayProps> = ({ post }) => {
    const formatDate = (date: Date) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    }

    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                {post.type === ContentType.TEXT && <Card.Text>{post.content}</Card.Text>}
                {post.type === ContentType.VIDEO && <Player url={post.contentLink} controls playing={false} playsinline />}
                {post.type === ContentType.PDF &&
                    <>
                        <Card.Text>{post.content}</Card.Text>
                        <a href={post.contentLink} download className="btn btn-primary">
                            Download PDF
                        </a>
                    </>
                }
            </Card.Body>
            <Card.Footer>
                <small className="text-muted">Posted by {post.author} at {formatDate(new Date(post.createdAt))}</small>
            </Card.Footer>
        </Card>
    );
};

export default PostDisplay;
