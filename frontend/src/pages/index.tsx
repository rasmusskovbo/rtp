import { useState, useEffect } from 'react';
import Layout from "@/components/global/Layout";
import ImageCarousel from "@/components/frontpage/ImageCarousel";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import Header from "@/components/global/Header";
import PostDisplay from "@/components/posts/PostDisplay";
import { Container, Row, Col } from 'react-bootstrap';

const Home: React.FC = () => {
    const imagePaths = [
        "/images/slide1.jpg",
        "/images/slide2.jpg",
        "/images/slide3.jpg",
        "/images/slide4.jpg",
        "/images/slide5.jpg",
        "/images/slide6.jpg",
        "/images/slide7.jpg",
    ]

    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch(`${process.env.API_URL}/api/posts?amount=10`)
            .then(response => response.json())
            .then(data => setPosts(data));
    }, []);

    return (
        <Layout>
            <div>
                <RoadToPinkHead title={"Home"}/>
                <ImageCarousel images={imagePaths}/>
                <Header title={"Road To Pink"} subtitle={"A League Of Would-Be Champions"}/>
                <Container className="px-4 px-lg-5">
                    <Row className="gx-4 gx-lg-5 justify-content-center">
                        <Col md={10} lg={8} xl={7}>
                            {posts.map((post, index) => (
                                <PostDisplay key={index} post={post} />
                            ))}
                        </Col>
                    </Row>
                </Container>
            </div>
        </Layout>
    )
}

export default Home;
