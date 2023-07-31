import React, { FC, useState } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
import PostDisplay, { PostsEntity, ContentType } from './PostDisplay';

interface PostPreviewProps {
    post: PostsEntity;
}

const PostPreview: FC<PostPreviewProps> = ({ post }) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const displayContent = post.type === ContentType.TEXT ? post.content.substring(0, 100) : post.type.toLocaleUpperCase();

    return (
        <>
            <Card className="mb-4 post-card">
                <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text className="text-overflow">{displayContent}</Card.Text>
                    <Button variant="primary" onClick={handleShow}>
                        Read More
                    </Button>
                </Card.Body>
                <Card.Footer>
                    <small className="text-muted">Posted by {post.author}</small>
                </Card.Footer>
            </Card>

            <Modal show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{post.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PostDisplay post={post} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PostPreview;