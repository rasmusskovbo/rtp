import { useState, useEffect } from 'react';
import Layout from "@/components/global/Layout";
import ImageCarousel from "@/components/frontpage/ImageCarousel";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import Header from "@/components/global/Header";
import PostDisplay from "@/components/posts/PostDisplay";
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import Matchups from "@/components/matchups/Matchups";
import PowerRankingsTable from "@/components/tables/PowerRankingsTable";
import { PowerRankingsProps } from "@/components/tables/RtpStatsTypes";
import axios from "axios";

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
    const [rankings, setRankings] = useState<PowerRankingsProps['rankings']>([]);
    const [rankingsLoading, setRankingsLoading] = useState(true);
    const [rankingsError, setRankingsError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${process.env.API_URL}/api/posts?amount=10`)
            .then(response => response.json())
            .then(data => setPosts(data));
    }, []);

    useEffect(() => {
        const fetchPowerRankings = async () => {
            try {
                setRankingsLoading(true);
                setRankingsError(null);
                
                const response = await axios.get(`${process.env.API_URL}/api/power-rankings`);
                
                if (response.data?.rankings && Array.isArray(response.data.rankings)) {
                    setRankings(response.data.rankings);
                } else {
                    setRankingsError('Invalid data received from server');
                }
            } catch (err) {
                console.error('Error fetching power rankings:', err);
                setRankingsError('Failed to load power rankings. Please try again later.');
            } finally {
                setRankingsLoading(false);
            }
        };

        fetchPowerRankings();
    }, []);

    return (
        <Layout>
            <div>
                <RoadToPinkHead title={"Home"}/>
                <ImageCarousel images={imagePaths}/>
                <Header title={"Road To Pink"} subtitle={"A League Of Would-Be Champions"}/>
                <Container fluid className="px-4 px-lg-5">
                    {/* Power Rankings and Matchups Section */}
                    <Row className="gx-0 justify-content-center mb-4">
                        <Col xs={12} lg={5} className="pe-lg-3">
                            <div className="mb-3">
                                <h3 className="text-center">Power Rankings</h3>
                            </div>
                            {rankingsLoading ? (
                                <div className="text-center">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                    <p className="mt-3">Loading power rankings...</p>
                                </div>
                            ) : rankingsError ? (
                                <div className="text-center">
                                    <div className="alert alert-danger" role="alert">
                                        {rankingsError}
                                    </div>
                                </div>
                            ) : rankings.length > 0 ? (
                                <PowerRankingsTable rankings={rankings} />
                            ) : (
                                <div className="text-center">
                                    <p>No power rankings data available.</p>
                                </div>
                            )}
                        </Col>
                        
                        {/* Vertical Divider */}
                        <Col xs={12} lg={1} className="d-flex justify-content-center align-items-start pt-5">
                            <div style={{ 
                                width: '2px', 
                                height: '400px', 
                                backgroundColor: '#e0e0e0',
                                marginTop: '20px'
                            }}></div>
                        </Col>
                        
                        <Col xs={12} lg={5} className="ps-lg-3">
                            <Matchups/>
                        </Col>
                    </Row>
                    
                    {/* Horizontal Divider */}
                    <hr style={{ borderColor: '#e0e0e0', borderWidth: '2px', marginBottom: '30px' }} />
                    
                    {/* Posts Section */}
                    <Row className="gx-4 gx-lg-5 justify-content-center">
                        <Col sm={12} md={8}>
                            <div className="mb-3">
                                <h3 className="text-center">Recent Posts</h3>
                            </div>
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