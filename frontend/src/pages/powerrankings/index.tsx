import { NextPage } from 'next';
import React, { useContext, useState } from 'react';
import Layout from '@/components/global/Layout';
import RoadToPinkHead from '@/components/global/RoadToPinkHead';
import Header from '@/components/global/Header';
import { AuthContext } from '@/auth/AuthProvider';
import { Container, Row, Col, Button } from 'react-bootstrap';
import LoginPopup from '@/components/upload/LoginPopup';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import axios from 'axios';

const PowerRankingsPage: NextPage = () => {
  const authContext = useContext(AuthContext);
  const { loggedInUser } = authContext;
  const [showLogin, setShowLogin] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setTimeout(() => {
      router.replace(redirectAfterLogin ?? '/powerrankings');
    }, 500);
  };

  const handleAddClick = async () => {
    if (!loggedInUser) {
      setRedirectAfterLogin('/powerrankings/input');
      toast.info('Please log in to continue.', { position: toast.POSITION.TOP_RIGHT });
      setShowLogin(true);
      return;
    }

    try {
      setChecking(true);
      const username = loggedInUser.name;
      const { data } = await axios.get(`${process.env.API_URL}/api/power-rankings/user`, {
        params: { username },
      });

      const userRankings = Array.isArray(data?.userRankings) ? data.userRankings : [];
      if (userRankings.length >= 12) {
        toast.info('You have already submitted rankings for this week.', { position: toast.POSITION.TOP_RIGHT });
        return;
      }

      router.push('/powerrankings/input');
    } catch (error) {
      console.error('Error checking user rankings:', error);
      toast.error('Could not verify submission status. Please try again later.');
    } finally {
      setChecking(false);
    }
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
        <Header title={'Power Rankings Input'} />
        <Container className="px-4 px-lg-5">
          <Row className="gx-4 gx-lg-5 justify-content-center">
            <Col sm={12} md={8} className="text-center">
              <Button variant="primary" onClick={handleAddClick} disabled={checking}>
                Add Power Rankings
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </Layout>
  );
};

export default PowerRankingsPage;
