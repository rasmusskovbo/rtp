import { NextPage } from 'next';
import React, { useContext, useState, useEffect } from 'react';
import Layout from '@/components/global/Layout';
import RoadToPinkHead from '@/components/global/RoadToPinkHead';
import Header from '@/components/global/Header';
import { AuthContext } from '@/auth/AuthProvider';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import LoginPopup from '@/components/upload/LoginPopup';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import axios from 'axios';
import PowerRankingsTable from '@/components/tables/PowerRankingsTable';
import { PowerRankingsProps } from '@/components/tables/RtpStatsTypes';

const PowerRankingsPage: NextPage = () => {
  const authContext = useContext(AuthContext);
  const { loggedInUser } = authContext;
  const [showLogin, setShowLogin] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [rankings, setRankings] = useState<PowerRankingsProps['rankings']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setTimeout(() => {
      router.replace(redirectAfterLogin ?? '/powerrankings');
    }, 500);
  };

  useEffect(() => {
    const fetchPowerRankings = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`${process.env.API_URL}/api/power-rankings`);
        
        if (data?.rankings && Array.isArray(data.rankings)) {
          setRankings(data.rankings);
        } else {
          setError('Invalid data received from server');
        }
      } catch (err) {
        console.error('Error fetching power rankings:', err);
        setError('Failed to load power rankings. Please try again later.');
        toast.error('Failed to load power rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPowerRankings();
  }, []);

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

      if (userRankings.length > 0) {
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
        <Header title={'Power Rankings'} />
        
        {loading ? (
          <Container className="px-4 px-lg-5">
            <Row className="gx-4 gx-lg-5 justify-content-center">
              <Col sm={12} md={8} className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading power rankings...</p>
              </Col>
            </Row>
          </Container>
        ) : error ? (
          <Container className="px-4 px-lg-5">
            <Row className="gx-4 gx-lg-5 justify-content-center">
              <Col sm={12} md={8} className="text-center">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </Col>
            </Row>
          </Container>
        ) : (
          <>
            <Container className="px-4 px-lg-5">
              <Row className="gx-4 gx-lg-5 justify-content-center mb-4">
                <Col sm={12} md={8} className="text-center">
                  <Button variant="primary" onClick={handleAddClick} disabled={checking}>
                    {checking ? 'Checking...' : 'Add Power Rankings'}
                  </Button>
                </Col>
              </Row>
            </Container>
            
            {rankings.length > 0 ? (
              <PowerRankingsTable rankings={rankings} />
            ) : (
              <Container className="px-4 px-lg-5">
                <Row className="gx-4 gx-lg-5 justify-content-center">
                  <Col sm={12} md={8} className="text-center">
                    <p>No power rankings data available.</p>
                  </Col>
                </Row>
              </Container>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PowerRankingsPage;
