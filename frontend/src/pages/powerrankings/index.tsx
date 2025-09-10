import { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import Layout from '@/components/global/Layout';
import RoadToPinkHead from '@/components/global/RoadToPinkHead';
import Header from '@/components/global/Header';
import { AuthContext } from '@/auth/AuthProvider';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import LoginPopup from '@/components/upload/LoginPopup';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const PowerRankingsPage: NextPage = () => {
  const authContext = useContext(AuthContext);
  const { loggedInUser, loading } = authContext;
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !loggedInUser) {
      toast.info('Please log in to access Power Rankings.', {
        position: toast.POSITION.TOP_RIGHT,
      });
      setShowLogin(true);
    }
  }, [loading, loggedInUser]);

  const handleLoginSuccess = () => {
    setTimeout(() => {
      router.replace('/powerrankings');
    }, 500);
  };

  if (loading) {
    return (
      <Layout>
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <Spinner animation="border" />
        </Container>
      </Layout>
    );
  }

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
        <Header title={'Power Rankings Input'} />
        {loggedInUser ? (
          <Container className="px-4 px-lg-5">
            <Row className="gx-4 gx-lg-5 justify-content-center">
              <Col sm={12} md={8}>
                {/* Placeholder content; form to be added later */}
                <div className="text-center">
                  <p>Power Rankings input coming soon.</p>
                </div>
              </Col>
            </Row>
          </Container>
        ) : (
          <Container className="px-4 px-lg-5">
            <Row className="gx-4 gx-lg-5 justify-content-center">
              <Col sm={12} md={8} className="text-center">
                <p>You need to be logged in to submit Power Rankings.</p>
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

export default PowerRankingsPage;
