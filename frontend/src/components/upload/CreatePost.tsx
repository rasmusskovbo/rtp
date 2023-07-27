import React, { ChangeEvent, FormEvent, useState } from 'react';
import {Button, Container, Form, Row, Col} from 'react-bootstrap';
import {toast} from "react-toastify";

enum ContentType {
    TEXT = 'text',
    VIDEO = 'video',
    PDF = 'pdf'
}

// add validation on file selected.
const PostForm = () => {
    const [title, setTitle] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [type, setType] = useState<ContentType | ''>('');
    const [content, setContent] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : '');
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('type', type);
        formData.append('content', content);

        if (file) {
            formData.append('file', file, file.name);
        }

        try {
            const response = await fetch('http://localhost:4001/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                toast.error("Error occurred while attempting to upload. Check with admin before trying again");
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                toast.success("Your update has been posted!");
            }

            const data = await response.json();
        } catch (error) {
            console.error('Error:', error);
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
                            <Form.Control type='text' value={author} onChange={(e) => setAuthor(e.target.value)} required />
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
                                    <Form.Control type="file" onChange={onFileChange} />
                                    <Form.Text className='text-muted'>
                                        {fileName}
                                    </Form.Text>
                                </Form.Group>
                            </>
                        )}
                        <Button variant='primary' type='submit'>
                            Submit
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default PostForm;
