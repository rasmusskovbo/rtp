import React, {ChangeEvent, FormEvent, useContext, useEffect, useState} from 'react';
import {Button, Container, Form, Row, Col, Spinner, ProgressBar, Modal} from 'react-bootstrap';
import {toast} from "react-toastify";
import {AuthContext} from "@/auth/AuthProvider";
import axios from 'axios';

enum ContentType {
    TEXT = 'text',
    VIDEO = 'video',
    PDF = 'pdf'
}

const PostForm = () => {
    const authContext = useContext(AuthContext); // Use the context
    const {loggedInUser, loading} = authContext; // Assume there's a `loading` state provided

    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState<ContentType | ''>('');
    const [content, setContent] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    useEffect(() => {
        if (!loading) {
            setAuthor(loggedInUser ? loggedInUser.name : '');
        }
    }, [loading, loggedInUser]);

    if (loading) {
        return (
            <div className="spinnerContainer">
                <Spinner animation="border" />
            </div>)
    }

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            const extension = selectedFile.name.split('.').pop()?.toLowerCase();
            if (type === ContentType.PDF && extension !== 'pdf') {
                toast.error('Only PDF files are accepted');
                return;
            } else if (type === ContentType.VIDEO && extension !== 'mp4') {
                toast.error('Only MP4 files are accepted');
                return;
            }
            setFile(selectedFile);
            setFileName(selectedFile ? selectedFile.name : '');
        }
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('type', type);

        if (content) {
            formData.append('content', content.replace(/\r\n|\r|\n/g, '\n'));
        }

        if (file) {
            formData.append('file', file, file.name);
        }

        try {
            const response = await axios({
                url: `${process.env.API_URL}/api/upload`,
                method: 'POST',
                data: formData,
                onUploadProgress: progressEvent => {
                    let percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(percentCompleted);
                }

            });

            if (response.status >= 200 && response.status < 300) {
                toast.success("Your update has been posted!");
            } else {
                toast.error("Error occurred while attempting to upload. Check with admin before trying again");
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error when uploading:', error);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <Container>
            <Row>
                <Col className='col-12 col-md-6 mx-auto'>
                    <Form onSubmit={onSubmit}>
                        <Form.Group controlId='title' className='mb-3'>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type='text' value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId='author' className='mb-3'>
                            <Form.Label>Author</Form.Label>
                            <Form.Control
                                type='text'
                                value={author}
                                readOnly
                                required
                                className='text-muted'
                            />
                        </Form.Group>
                        <Form.Group controlId='type' className='mb-3'>
                            <Form.Label>Content Type</Form.Label>
                            <Form.Control as='select' value={type} onChange={(e) => setType(e.target.value as ContentType)} required>
                                <option value=''>Select a content type...</option>
                                <option value={ContentType.TEXT}>Text</option>
                                <option value={ContentType.VIDEO}>Video</option>
                                <option value={ContentType.PDF}>PDF</option>
                            </Form.Control>
                        </Form.Group>
                        {(type === ContentType.TEXT || type === ContentType.PDF) && (
                            <Form.Group controlId='content' className='mb-3'>
                                <Form.Label>Content</Form.Label>
                                <Form.Control as='textarea' rows={3} value={content} onChange={(e) => setContent(e.target.value)} required />
                            </Form.Group>
                        )}
                        {type && type !== ContentType.TEXT && (
                            <>
                                <Form.Group className='mb-3' controlId='file'>
                                    <Form.Label>File input</Form.Label>
                                    <Form.Control type="file" onChange={onFileChange} accept={type === ContentType.PDF ? '.pdf' : type === ContentType.VIDEO ? '.mp4' : '*'} />
                                    <Form.Text className='text-muted'>
                                        {fileName}
                                    </Form.Text>
                                </Form.Group>
                            </>
                        )}
                        <Button variant='primary' type='submit' disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Submit'}
                        </Button>
                    </Form>
                </Col>
            </Row>

            <Modal show={uploading} backdrop="static" centered>
                <Modal.Header>
                    <Modal.Title>Uploading...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} />
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default PostForm;
