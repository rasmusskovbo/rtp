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
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [overPosition, setOverPosition] = useState<'above' | 'below' | null>(null);
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

  useEffect(() => {
    // Detect coarse pointer / touch devices for mobile-friendly controls
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      setIsTouchDevice(!!isTouch);
    }
  }, []);

  const handleDragStart = (index: number, e: React.DragEvent<HTMLTableRowElement>) => {
    draggedIndexRef.current = index;
    setDraggingIndex(index);
    // Improve drag image behavior
    if (e.dataTransfer.setDragImage) {
      const crt = document.createElement('div');
      crt.style.padding = '8px 12px';
      crt.style.background = '#fff';
      crt.style.border = '2px solid #0d6efd';
      crt.style.borderRadius = '6px';
      crt.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      crt.style.position = 'absolute';
      crt.style.top = '-9999px';
      crt.textContent = `Moving row #${index + 1}`;
      document.body.appendChild(crt);
      e.dataTransfer.setDragImage(crt, 0, 0);
      setTimeout(() => document.body.removeChild(crt), 0);
    }
  };

  const handleDragOver = (index: number, e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    if (draggedIndexRef.current === null) return;
    const rect = (e.currentTarget as HTMLTableRowElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const isAbove = e.clientY < midpoint;
    setOverIndex(index);
    setOverPosition(isAbove ? 'above' : 'below');
  };

  const clearDragState = () => {
    draggedIndexRef.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
    setOverPosition(null);
  };

  const handleDrop = (targetIndex: number) => {
    const from = draggedIndexRef.current;
    if (from === null) return;
    setTeamsOrder((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      let insertionIndex = overPosition === 'above' ? targetIndex : targetIndex + 1;
      if (from < insertionIndex) insertionIndex -= 1;
      updated.splice(insertionIndex, 0, moved);
      return updated;
    });
    clearDragState();
  };

  const handleDragEnd = () => {
    clearDragState();
  };

  const moveRow = (from: number, to: number) => {
    if (to < 0 || to >= teamsOrder.length) return;
    setTeamsOrder((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
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
                      <div className="d-flex align-items-center gap-2">
                        <Button variant="secondary" onClick={() => router.push('/powerrankings')}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSubmit}
                          disabled={submitting || teamsOrder.length !== 12}
                        >
                          {submitting ? 'Submitting…' : 'Submit Rankings'}
                        </Button>
                      </div>
                    </div>
                    <Table striped responsive="sm" className="text-center">
                      <thead>
                        <tr>
                          <th scope="col">Rank</th>
                          <th scope="col">Team Logo</th>
                          <th scope="col">Team Name</th>
                          <th scope="col">Owner</th>
                          {isTouchDevice && <th scope="col">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {teamsOrder.map((team, index) => {
                          const isDragging = draggingIndex === index;
                          const showTopLine = draggingIndex !== null && overIndex === index && overPosition === 'above';
                          const showBottomLine = draggingIndex !== null && overIndex === index && overPosition === 'below';
                          return (
                            <tr
                              key={team.id}
                              draggable={!isTouchDevice}
                              onDragStart={(e) => handleDragStart(index, e)}
                              onDragOver={(e) => handleDragOver(index, e)}
                              onDrop={() => handleDrop(index)}
                              onDragEnd={handleDragEnd}
                              style={{
                                cursor: isTouchDevice ? 'default' : 'grab',
                                outline: isDragging ? '2px solid #0d6efd' : 'none',
                                outlineOffset: '-2px',
                                borderTop: showTopLine ? '3px solid #0d6efd' : undefined,
                                borderBottom: showBottomLine ? '3px solid #0d6efd' : undefined,
                                backgroundColor: isDragging ? 'rgba(13,110,253,0.04)' : undefined,
                              }}
                              title={isTouchDevice ? undefined : 'Drag to reorder'}
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
                              {isTouchDevice && (
                                <td className="v-center">
                                  <div className="d-flex justify-content-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline-secondary"
                                      disabled={index === 0}
                                      onClick={() => moveRow(index, index - 1)}
                                      aria-label={`Move ${team.teamName} up`}
                                    >
                                      ▲
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-secondary"
                                      disabled={index === teamsOrder.length - 1}
                                      onClick={() => moveRow(index, index + 1)}
                                      aria-label={`Move ${team.teamName} down`}
                                    >
                                      ▼
                                    </Button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    
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
