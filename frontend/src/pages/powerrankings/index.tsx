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
import PowerRankingTrophies from '@/components/tables/PowerRankingTrophies';
import RandomTrophies from '@/components/tables/RandomTrophies';
import RandomComments from '@/components/powerrankings/RandomComments';
import { PowerRankingsProps, TrophyData } from '@/components/tables/RtpStatsTypes';

// Import team logos
const ballotBoxBaronImagePath = require("../../assets/ballotboxbaron.png");
const couchPotatoImagePath = require("../../assets/couchpotato.png");
const fanfavouriteImagePath = require("../../assets/fanfavourite.png");
const lonelyLockerRoomImagePath = require("../../assets/lonelylockerroom.png");
const underdogImagePath = require("../../assets/underdog.png");
const chokerImagePath = require("../../assets/choker.png");

const PowerRankingsPage: NextPage = () => {
  const authContext = useContext(AuthContext);
  const { loggedInUser } = authContext;
  const [showLogin, setShowLogin] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [rankings, setRankings] = useState<PowerRankingsProps['rankings']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [weeklyRanks, setWeeklyRanks] = useState<Record<number, Record<number, number>>>({});
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [trophies, setTrophies] = useState<TrophyData[]>([]);
  const [trophiesLoading, setTrophiesLoading] = useState(false);
  const [trophiesError, setTrophiesError] = useState<string | null>(null);
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
        
        // Fetch current week and rankings in parallel
        const [rankingsResponse, currentWeekResponse] = await Promise.all([
          axios.get(`${process.env.API_URL}/api/power-rankings`),
          axios.get(`${process.env.API_URL}/api/power-rankings/current-week`)
        ]);
        
        if (rankingsResponse.data?.rankings && Array.isArray(rankingsResponse.data.rankings)) {
          setRankings(rankingsResponse.data.rankings);
        } else {
          setError('Invalid data received from server');
        }
        
        if (currentWeekResponse.data?.currentWeek) {
          setCurrentWeek(currentWeekResponse.data.currentWeek);
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

  // Fetch available weeks and weekly rankings for trend chart
  useEffect(() => {
    const fetchTrends = async () => {
      if (!rankings || rankings.length === 0) return;
      try {
        setTrendLoading(true);
        setTrendError(null);
        // Always show weeks 1-17 regardless of available data
        const weeksArr = Array.from({ length: 17 }, (_, i) => i + 1);
        setWeeks(weeksArr);

        // Fetch data for available weeks only
        const weeksResp = await axios.get(`${process.env.API_URL}/api/power-rankings/weeks`);
        const availableWeeks: number[] = Array.isArray(weeksResp.data?.weeks) ? weeksResp.data.weeks : [];
        const boundedWeeks = availableWeeks.filter((w) => w >= 1 && w <= 17).sort((a, b) => a - b);

        if (boundedWeeks.length === 0) {
          setWeeklyRanks({});
          return;
        }

        const requests = boundedWeeks.map((w) => axios.get(`${process.env.API_URL}/api/power-rankings/week/${w}`));
        const results = await Promise.all(requests);
        const weekToRanks: Record<number, Record<number, number>> = {};
        results.forEach((resp, idx) => {
          const weekNum = boundedWeeks[idx];
          const ranksForWeek: Record<number, number> = {};
          const r = resp.data?.rankings ?? [];
          if (Array.isArray(r)) {
            r.forEach((item: any) => {
              const teamId = item?.team?.id;
              const rankVal = typeof item?.currentRank === 'number' ? item.currentRank : undefined;
              if (teamId && typeof rankVal === 'number') ranksForWeek[teamId] = rankVal;
            });
          }
          weekToRanks[weekNum] = ranksForWeek;
        });
        setWeeklyRanks(weekToRanks);
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setTrendError('Failed to load trend data.');
      } finally {
        setTrendLoading(false);
      }
    };

    fetchTrends();
  }, [rankings]);

  // Fetch trophy data
  useEffect(() => {
    const fetchTrophies = async () => {
      try {
        setTrophiesLoading(true);
        setTrophiesError(null);
        
        const response = await axios.get(`${process.env.API_URL}/api/power-rankings/trophies`);
        
        if (response.data?.trophies && Array.isArray(response.data.trophies)) {
          setTrophies(response.data.trophies);
        } else {
          setTrophiesError('Invalid trophy data received from server');
        }
      } catch (err) {
        console.error('Error fetching trophies:', err);
        setTrophiesError('Failed to load trophy data. Please try again later.');
      } finally {
        setTrophiesLoading(false);
      }
    };

    fetchTrophies();
  }, []);

  // Color palette matching the reference chart
  const teamColors = [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Olive
    '#17becf', // Cyan
    '#ff9896', // Light Red
    '#98df8a'  // Light Green
  ];
  
  const teamColor = (index: number) => teamColors[index % teamColors.length];

  // Team logo mapping
  const getTeamLogo = (teamName: string) => {
    const logoMap: Record<string, string> = {
      'Ballot Box Baron': ballotBoxBaronImagePath,
      'The Choker': chokerImagePath,
      'Couch Potato': couchPotatoImagePath,
      'Fan Favourite': fanfavouriteImagePath,
      'Lonely Locker Room': lonelyLockerRoomImagePath,
      'The Underdog': underdogImagePath
    };
    return logoMap[teamName] || '';
  };

  // Build series ordered by current week's rank (ascending)
  const orderedTeams = [...rankings].sort((a, b) => a.currentRank - b.currentRank);

  const renderTrendChart = () => {
    if (trendLoading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading…</span>
          </Spinner>
          <p className="mt-2">Loading rank trends…</p>
        </div>
      );
    }
    if (trendError || weeks.length === 0) {
      return <p className="text-muted text-center">No trend data available.</p>;
    }

    const padding = { top: 20, right: 50, bottom: 40, left: 200 };
    const rankMin = 1;
    const rankMax = 12;
    const colWidth = 40;
    const rowHeight = 30; // for rank grid; not strict since y is scaled
    const chartWidth = padding.left + padding.right + (weeks.length - 1) * colWidth + 1;
    const chartHeight = padding.top + padding.bottom + (rankMax - rankMin) * rowHeight + 1;

    const xForWeek = (w: number) => padding.left + (weeks.indexOf(w)) * colWidth;
    const yForRank = (r: number) => {
      const clamped = Math.max(rankMin, Math.min(rankMax, r));
      // invert so rank 1 is at the top
      return padding.top + (clamped - rankMin) * rowHeight;
    };

    const buildPathForTeam = (teamId: number) => {
      let d = '';
      let hasStarted = false;
      weeks.forEach((w) => {
        const rankVal = weeklyRanks[w]?.[teamId];
        if (typeof rankVal === 'number') {
          const x = xForWeek(w);
          const y = yForRank(rankVal);
          if (!hasStarted) {
            d += `M ${x} ${y}`;
            hasStarted = true;
          } else {
            d += ` L ${x} ${y}`;
          }
        } else {
          hasStarted = false;
        }
      });
      return d;
    };

    return (
      <div className="mt-4">
        <h4 className="mb-3 text-center" style={{ color: '#343a40', fontFamily: 'sans-serif' }}>Power Rankings Chart</h4>
        <hr style={{ borderColor: '#e0e0e0', borderWidth: '1px', marginBottom: '20px' }} />
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', minWidth: chartWidth, backgroundColor: 'white' }}>
            {/* X grid and labels */}
            {weeks.map((w) => {
              const x = xForWeek(w);
              return (
                <g key={`x-${w}`}>
                  <line x1={x} y1={padding.top} x2={x} y2={chartHeight - padding.bottom} stroke="#e0e0e0" strokeWidth={1} />
                  <text x={x} y={chartHeight - 6} textAnchor="middle" fill="#6c757d" fontSize="12">{w}</text>
                </g>
              );
            })}
            
            {/* X-axis label */}
            <text x={chartWidth / 2} y={chartHeight - 20} textAnchor="middle" fill="#6c757d" fontSize="12" fontFamily="sans-serif">Week Number</text>

            {/* Y grid and labels (ranks 1..12) */}
            {Array.from({ length: rankMax - rankMin + 1 }, (_, i) => i + rankMin).map((r) => {
              const y = yForRank(r);
              return (
                <g key={`y-${r}`}>
                  <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e0e0e0" strokeWidth={1} />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#6c757d" fontSize="12" fontFamily="sans-serif">{r}</text>
                </g>
              );
            })}

            {/* Lines for each team (ordered by current rank) */}
            {orderedTeams.map((t, idx) => {
              const color = teamColor(idx);
              const d = buildPathForTeam(t.team.id);
              return (
                <g key={`team-path-${t.team.id}`}>
                  <path d={d} fill="none" stroke={color} strokeWidth={2} opacity={1} />
                  {weeks.map((w) => {
                    const rankVal = weeklyRanks[w]?.[t.team.id];
                    if (typeof rankVal !== 'number') return null;
                    const x = xForWeek(w);
                    const y = yForRank(rankVal);
                    return (
                      <g key={`dot-${t.team.id}-${w}`}> 
                        <circle cx={x} cy={y} r={2.5} fill={color} />
                        <title>{`${t.team.teamName} — Week ${w}: ${rankVal.toFixed(1)}`}</title>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Team names and logos on the left */}
            {orderedTeams.map((t, idx) => {
              const color = teamColor(idx);
              const logoPath = getTeamLogo(t.team.teamName);
              // Position team name at the left edge, vertically centered with the line
              const teamNameX = logoPath ? 35 : 10; // Offset for logo if available
              const teamNameY = padding.top + (idx + 0.5) * ((chartHeight - padding.top - padding.bottom) / orderedTeams.length);
              return (
                <g key={`team-name-${t.team.id}`}>
                  {logoPath && (
                    <image
                      href={logoPath}
                      x={5}
                      y={teamNameY - 8}
                      width={20}
                      height={20}
                    />
                  )}
                  <text x={teamNameX} y={teamNameY} fill={color} fontSize="12" fontFamily="sans-serif" textAnchor="start">
                    {t.team.teamName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="text-muted small mt-2 text-center" style={{ fontFamily: 'sans-serif' }}>Teams ordered by current week rank.</div>
      </div>
    );
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
        <Header title={currentWeek ? `Power Rankings for Week ${currentWeek}` : 'Power Rankings'} />
        
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
            
            {/* Random Trophies Section */}
            <Container className="px-4 px-lg-5">
              <Row className="gx-4 gx-lg-5 justify-content-center">
                <Col xs={12}>
                  {trophiesLoading ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Loading featured trophies...</span>
                      </Spinner>
                    </div>
                  ) : trophiesError ? (
                    <div className="text-center">
                      <small className="text-muted">Featured trophies unavailable</small>
                    </div>
                  ) : (
                    <RandomTrophies trophies={trophies} />
                  )}
                </Col>
              </Row>
            </Container>

            {/* Random Comments Section */}
            <Container className="px-4 px-lg-5">
              <Row className="gx-4 gx-lg-5 justify-content-center">
                <Col xs={12}>
                  <RandomComments />
                </Col>
              </Row>
            </Container>
            
            {rankings.length > 0 ? (
              <>
                <Container fluid className="px-4 px-lg-5">
                  <Row className="gx-4 gx-lg-5 justify-content-center">
                    <Col xs={12}>
                      <div style={{ width: '90vw', maxWidth: '100%', margin: '0 auto' }}>
                        <PowerRankingsTable rankings={rankings} />
                      </div>
                    </Col>
                  </Row>
                </Container>

                <Container fluid className="px-4 px-lg-5">
                  <Row className="gx-4 gx-lg-5 justify-content-center">
                    <Col xs={12}>
                      <div style={{ width: '90vw', maxWidth: '100%', margin: '0 auto' }}>
                        {renderTrendChart()}
                      </div>
                    </Col>
                  </Row>
                </Container>

                {/* Trophies Section */}
                <Container className="px-4 px-lg-5">
                  <Row className="gx-4 gx-lg-5 justify-content-center">
                    <Col xs={12}>
                      {trophiesLoading ? (
                        <div className="text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading trophies...</span>
                          </Spinner>
                          <p className="mt-2">Loading trophies...</p>
                        </div>
                      ) : trophiesError ? (
                        <div className="text-center">
                          <div className="alert alert-warning" role="alert">
                            {trophiesError}
                          </div>
                        </div>
                      ) : (
                        <PowerRankingTrophies trophies={trophies} />
                      )}
                    </Col>
                  </Row>
                </Container>
              </>
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
