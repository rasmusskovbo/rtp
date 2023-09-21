import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {Card, Container, Row, Col, Spinner} from 'react-bootstrap';
import Image from "next/image";

const ballotBoxBaronImagePath = require("../../assets/ballotboxbaron.png")
const couchPotatoImagePath = require("../../assets/couchpotato.png")
const fanfavouriteImagePath = require("../../assets/fanfavourite.png")
const lonelyLockerRoomImagePath = require("../../assets/lonelylockerroom.png")
const underdogImagePath = require("../../assets/underdog.png")
const chokerImagePath = require("../../assets/choker.png")


interface Team {
    id: number;
    sleeperUsername: string;
    teamName: string;
    ownerName: string;
    nationality: string | null;
    teamMascot: string;
    yearsInLeague: number;
    bio: string;
    teamLogo: string;
    ownerImage: string;
}

export interface PicksStatistics {
    teamWithLeastVotes: Team | null;
    teamWithMostVotes: Team | null;
    teamWithLeastVotesMostWins: Team | null;
    teamWithMostVotesLeastWins: Team | null;
    userWithMostVotes: string | null;
    userWithLeastVotes: string | null;
}


const PicksLeaders = () => {
    const [data, setData] = useState<PicksStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.API_URL}/api/picks/stats`);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="spinnerContainer">
                <Spinner animation="border" />
            </div>)
    }

    if (!data) {
        return <div>Error fetching data or no data available.</div>;
    }

    return (
        <Container>
            <hr className="centered-hr" />
            <Row className="mt-5">
                <h3 className="text-center">RTP Picks Leaders</h3>
                <Col md={3}>
                    <Card>
                        <Image src={fanfavouriteImagePath} alt={'Fan favourite'} width={400} height={400} layout="responsive"/>
                        <Card.Body>
                            <Card.Title>Golden Boy</Card.Title>
                            <Card.Subtitle>(Most Votes For)</Card.Subtitle>
                            <hr/>
                            <Card.Text>{data.teamWithMostVotes?.teamName}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Image src={lonelyLockerRoomImagePath} alt={'Fan favourite'} width={400} height={400} layout="responsive"/>
                        <Card.Body>
                            <Card.Title>Fan Un-Favourite</Card.Title>
                            <Card.Subtitle>(Least Votes For)</Card.Subtitle>
                            <hr/>
                            <Card.Text>{data.teamWithLeastVotes?.teamName}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Image src={underdogImagePath} alt={'The Underdog'} width={400} height={400} layout="responsive"/>
                        <Card.Body>
                            <Card.Title>The Underdog</Card.Title>
                            <Card.Subtitle>(Most Wins With Least Votes)</Card.Subtitle>
                            <hr/>
                            <Card.Text>{data.teamWithLeastVotesMostWins?.teamName}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Image src={chokerImagePath} alt={'The Choker'} width={400} height={400} layout="responsive"/>
                        <Card.Body>
                            <Card.Title>The Choker</Card.Title>
                            <Card.Subtitle>(Least Wins With Most Votes)</Card.Subtitle>
                            <hr/>
                            <Card.Text>{data.teamWithMostVotesLeastWins?.teamName}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Image src={ballotBoxBaronImagePath} alt={'Fan favourite'} width={400} height={400} layout="responsive"/>
                        <Card.Body>
                            <Card.Title>Ballot Box Baron</Card.Title>
                            <Card.Subtitle>(User with Most Votes)</Card.Subtitle>
                            <hr/>
                            <Card.Text>{data.userWithMostVotes}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Image src={couchPotatoImagePath} alt={'Fan favourite'} width={400} height={400} layout="responsive"/>
                        <Card.Body>
                            <Card.Title>Couch Potato</Card.Title>
                            <Card.Subtitle>(User with Least Votes)</Card.Subtitle>
                            <hr/>
                            <Card.Text>{data.userWithLeastVotes}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PicksLeaders;