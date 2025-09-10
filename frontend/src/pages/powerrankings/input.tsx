import { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import Layout from '@/components/global/Layout';
import RoadToPinkHead from '@/components/global/RoadToPinkHead';
import Header from '@/components/global/Header';
import { AuthContext } from '@/auth/AuthProvider';
import { Container, Row, Col, Button } from 'react-bootstrap';
import LoginPopup from '@/components/upload/LoginPopup';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import axios from 'axios';

const PowerRankingsInputPage: NextPage = () => {
  const authContext = useContext(AuthContext);
  const { loggedInUser } = authContext;
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      if (!loggedInUser) {
        toast.info('Please log in to add Power Rankings.', {
          position: toast.POSITION.TOP_RIGHT,
        });
        setShowLogin(true);
        return;
      }

      try {
        const username = loggedInUser.name;
        const { data } = await axios.get(`${process.env.API_URL}/api/power-rankings/user`, {
          params: { username },
        });

        const userRankings = Array.isArray(data?.userRankings) ? data.userRankings : [];
        if (userRankings.length >= 12) {
          toast.info('You have already submitted rankings for this week.', { position: toast.POSITION.TOP_RIGHT });
          router.replace('/powerrankings');
        }
      } catch (error) {
        console.error('Error checking user rankings:', error);
        toast.error('Could not verify submission status. Please try again later.');
        router.replace('/powerrankings');
      }
    };

    checkAccess();
  }, [loggedInUser, router]);

  const handleLoginSuccess = () => {
    setTimeout(() => {
      router.replace('/powerrankings/input');
    }, 500);
  };

  return (
    <Layout>
      <LoginPopup
        show={showLogin}
        handleShow={() => setShowLogin(true)}
        handleClose={() => setShowLogin(false)}
        handleLoginSuccess={handleLoginSuccess}
      />
      <div>
        <RoadToPinkHead title={'Power Rankings'} />
        <Header title={'Submit Your Power Rankings'} />
        {loggedInUser ? (
          <Container className="px-4 px-lg-5">
            <Row className="gx-4 gx-lg-5 justify-content-center">
              <Col sm={12} md={8}>
                {/* Placeholder; actual input UI to be added later */}
                <div className="text-center">
                  <p>Power Rankings submission form coming soon.</p>
                  <Button variant="secondary" onClick={() => router.push('/powerrankings')}>
                    Back to Power Rankings
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        ) : (
          <Container className="px-4 px-lg-5">
            <Row className="gx-4 gx-lg-5 justify-content-center">
              <Col sm={12} md={8} className="text-center">
                <p>You must be logged in to add Power Rankings.</p>
                <Button variant="primary" onClick={() => setShowLogin(true)}>
                  Log in
                </Button>
              </Col>
            </Row>
          </Container>
        )}
      </div>
    </Layout>
  );
};

export default PowerRankingsInputPage;
