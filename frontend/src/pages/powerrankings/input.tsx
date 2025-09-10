import { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import Layout from '@/components/global/Layout';
import RoadToPinkHead from '@/components/global/RoadToPinkHead';
import Header from '@/components/global/Header';
import { AuthContext } from '@/auth/AuthProvider';
import { Container, Row, Col, Button, Table, Figure, Spinner } from 'react-bootstrap';
import LoginPopup from '@/components/upload/LoginPopup';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import axios from 'axios';

const PowerRankingsInputPage: NextPage = () => {
  const authContext = useContext(AuthContext);
  const { loggedInUser } = authContext;
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  type Team = {
    id: number;
    teamName: string;
    ownerName: string;
    teamLogo: string;
  };

  type TeamRankingData = {
    team: Team;
  };

  const [teamsOrder, setTeamsOrder] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const draggedIndexRef = React.useRef<number | null>(null);

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

  useEffect(() => {
    const fetchTeams = async () => {
      if (!loggedInUser) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.API_URL}/api/power-rankings`);
        const rankings: TeamRankingData[] = Array.isArray(data?.rankings) ? data.rankings : [];
        const teams: Team[] = rankings.map((r) => ({
          id: r.team.id,
          teamName: r.team.teamName,
          ownerName: r.team.ownerName,
          teamLogo: r.team.teamLogo,
        }));
        setTeamsOrder(teams);
      } catch (error) {
        console.error('Error loading teams for input:', error);
        toast.error('Failed to load teams. Please try again later.');
        router.replace('/powerrankings');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [loggedInUser, router]);

  const handleDragStart = (index: number) => {
    draggedIndexRef.current = index;
  };

  const handleDrop = (targetIndex: number) => {
    const from = draggedIndexRef.current;
    if (from === null || from === targetIndex) return;
    setTeamsOrder((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
    draggedIndexRef.current = null;
  };

  const handleSubmit = async () => {
    if (!loggedInUser) {
      toast.info('Please log in to submit.', { position: toast.POSITION.TOP_RIGHT });
      setShowLogin(true);
      return;
    }
    if (teamsOrder.length !== 12) {
      toast.error('Please rank all 12 teams before submitting.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        username: loggedInUser.name,
        rankings: teamsOrder.map((team, idx) => ({ teamId: team.id, rank: idx + 1 })),
      };
      await axios.post(`${process.env.API_URL}/api/power-rankings/submit`, payload);
      toast.success('Rankings submitted successfully!');
      router.replace('/powerrankings');
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to submit rankings.';
      toast.error(message);
      if (typeof message === 'string' && message.toLowerCase().includes('already')) {
        router.replace('/powerrankings');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
              <Col sm={12} md={10} lg={8}>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3">Loading teams...</p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Drag rows to set ranks 1–12</h5>
                      <Button variant="secondary" onClick={() => router.push('/powerrankings')}>
                        Cancel
                      </Button>
                    </div>
                    <Table striped responsive="sm" className="text-center">
                      <thead>
                        <tr>
                          <th scope="col">Rank</th>
                          <th scope="col">Team Logo</th>
                          <th scope="col">Team Name</th>
                          <th scope="col">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamsOrder.map((team, index) => (
                          <tr
                            key={team.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(index)}
                            style={{ cursor: 'grab' }}
                            title="Drag to reorder"
                          >
                            <td className="v-center"><strong>{index + 1}</strong></td>
                            <td>
                              <Figure id="avatar" className="mb-0">
                                <Figure.Image
                                  width={32}
                                  height={32}
                                  alt={team.teamName}
                                  src={team.teamLogo}
                                  rounded
                                />
                              </Figure>
                            </td>
                            <td className="v-center"><strong>{team.teamName}</strong></td>
                            <td className="v-center">{team.ownerName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting || teamsOrder.length !== 12}
                      >
                        {submitting ? 'Submitting…' : 'Submit Rankings'}
                      </Button>
                    </div>
                  </>
                )}
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
