import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { TeamData } from "@/pages/teams";
import styles from './teamprofile.module.css';

const TeamProfile = ({ data }: { data: TeamData }) => {
    return (
        <Container fluid className={styles.container}>
            <Row>
                <Col>
                    <div className={styles["images-wrapper"]}>
                        <img className={styles["team-logo"]} src={data.teamLogo} alt="Team Logo" width="200" height="200" />
                        <img className={styles["owner-image"]} src={data.ownerImage} alt="Owner" width="200" height="200" />
                    </div>
                    <Col className="d-flex flex-column justify-content-between">
                        <div className={styles["team-name"]}>
                            <span className={styles["label"]}>{data.teamName}</span>
                        </div>
                        <div className={styles["team-detail"]}>
                            <span className={styles["label"]}>Team owner:</span>
                            <span className={styles["value"]}>{data.ownerName}</span>
                        </div>
                        <div className={styles["team-detail"]}>
                            <span className={styles["label"]}>Mascot:</span>
                            <span className={styles["value"]}>{data.teamMascot}</span>
                        </div>
                        <div className={styles["team-detail"]}>
                            <span className={styles["label"]}>Nationality:</span>
                            <span className={styles["value"]}>{data.nationality}</span>
                        </div>
                        <div className={styles["team-detail"]}>
                            <span className={styles["label"]}>Years in the league:</span>
                            <span className={styles["value"]}>{data.yearsInLeague}</span>
                        </div>
                        <div className={styles["team-bio"]}>
                            <span>{data.bio}</span>
                        </div>
                    </Col>
                </Col>
                <Col>
                    <Card className={styles.card}>
                        <Card.Header>Season Stats</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Wins:</span>
                                {data.seasonStats.wins}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Losses:</span>
                                {data.seasonStats.losses}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Ties:</span>
                                {data.seasonStats.ties}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Total pts.:</span>
                                {data.seasonStats.fpts}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Total pts. against:</span>
                                {data.seasonStats.fpts_against}
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <Card className={styles.card}>
                        <Card.Header>All Time Stats</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Wins:</span>
                                {data.allTimeStats.wins}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Playoff Appearances:</span>
                                {data.allTimeStats.playoffAppearances}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Pinks:</span>
                                {data.allTimeStats.pinks}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>All Time Record:</span>
                                {data.allTimeStats.allTimeRecord}
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <Card className={styles.card}>
                        <Card.Header>Rival</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Rival Team:</span>
                                {data.rival.rivalName}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Head To Head Record</span>
                                {data.rival.wins}  -  {data.rival.losses}
                            </ListGroup.Item>
                            <ListGroup.Item className={styles["stat-item"]}>
                                <span className={styles["stat-label"]}>Points scored</span>
                                {data.rival.fpts}  -  {data.rival.fpts_against}
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col>
                    <h3 style={{padding: "0.5rem"}}>Active Roster</h3>
                    <ListGroup>
                        {data.activeRoster
                            .sort((a, b) => {
                                const order = ['QB', 'RB', 'WR', 'TE', 'DEF'];
                                return order.indexOf(a.position) - order.indexOf(b.position);
                            })
                            .map((player, index) => (
                                <ListGroup.Item key={index} className={styles["player-item"]}>
                                    <span className={`${styles["player-position"]} ${styles[`player-position-${player.position}`]}`}>{player.position}</span>
                                    {player.name}
                                </ListGroup.Item>
                            ))}
                    </ListGroup>

                </Col>
            </Row>
        </Container>
    );
};

export default TeamProfile;
