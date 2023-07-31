import React, { useState, useEffect, FC } from 'react';
import {Form, Button, Spinner, Col, Row, Container} from 'react-bootstrap';
import { PostsEntity, ContentType } from '@/components/posts/PostDisplay';
import Header from "@/components/global/Header";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import Layout from "@/components/global/Layout";
import PostPreview from "@/components/posts/PostPreview";

const ArchivePage: FC = () => {
    const [posts, setPosts] = useState<PostsEntity[]>([]);
    const [filterType, setFilterType] = useState<string>('');
    const [filterAuthor, setFilterAuthor] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('http://localhost:4001/api/posts')
            .then(response => response.json())
            .then(data => setPosts(data))
            .then(() => setLoading(false))
    }, []);

    if (isLoading) {
        return <Spinner animation="border" />;
    }

    const filteredAndSortedPosts = posts
        .filter(post => filterType ? post.type === filterType : true)
        .filter(post => filterAuthor ? post.author.toLowerCase().includes(filterAuthor.toLowerCase()) : true)
        .sort((a, b) => sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    return (
        <Layout>
            <div>
                <RoadToPinkHead title={"Archive"}/>
                <Header title={"Post Archive"} subtitle={"Browse all posts"}/>
                <Container className="px-4 px-lg-5">
                    <Row className="gx-4 gx-lg-5 justify-content-center">
                        <Col md={10} lg={8} xl={7}>
                            <Form>
                                <Form.Group controlId="filterType">
                                    <Form.Label>Filter by Type</Form.Label>
                                    <Form.Control as="select" onChange={(e) => setFilterType(e.target.value)}>
                                        <option value="">All</option>
                                        {Object.values(ContentType).map((type, index) => (
                                            <option key={index} value={type}>{type}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="filterAuthor">
                                    <Form.Label>Filter by Author</Form.Label>
                                    <Form.Control type="text" placeholder="Author's name" onChange={(e) => setFilterAuthor(e.target.value)} />
                                </Form.Group>

                                <Form.Group controlId="sortOrder">
                                    <Form.Label>Sort by Date</Form.Label>
                                    <Form.Control as="select" onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
                                        <option value="desc">Newest First</option>
                                        <option value="asc">Oldest First</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                            <Row className="gx-4 gx-lg-5 justify-content-center">
                                {filteredAndSortedPosts.map((post, index) => (
                                    <Col md={4} key={index}>
                                        <PostPreview post={post} />
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Layout>
    );
};

export default ArchivePage;
