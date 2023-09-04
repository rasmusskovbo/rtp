import Layout from "@/components/global/Layout";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import Header from "@/components/global/Header";
import {Col, Container, Row} from "react-bootstrap";
import React from "react";
import Matchups from "@/components/matchups/Matchups";
import Leaderboard, {LeaderboardEntry, LeaderboardProps} from "@/components/picks/Leaderboard";
import axios from "axios";
import PicksLeaders from "@/components/picks/PicksLeaders";

const PicksPage = ({ leaderboardEntries }: LeaderboardProps) => {
    return (
        <Layout>
            <RoadToPinkHead title={"Picks"}/>
            <Header title={"Road To Pink Pick 'em!"}/>

            <Container className="px-4 px-lg-5">
                <Row className="gx-4 gx-lg-5 justify-content-center">
                    <Col sm={12} md={6}>
                        <h3 className="text-center">Leaderboards</h3>
                        <Leaderboard leaderboardEntries={leaderboardEntries} />
                    </Col>
                    <Col sm={12} md={6}>
                        <Matchups/>
                    </Col>
                </Row>
                <Row>
                    <Col m={8}>
                        <PicksLeaders/>
                    </Col>
                </Row>
            </Container>

        </Layout>
    );
};

export default PicksPage;

export const getServerSideProps = async () => {
    let leaderboardEntries: LeaderboardEntry[] = [];

    try {
        const response = await axios.get(`${process.env.API_URL}/api/picks/leaderboard`);
        console.log("Response: " + response.data)
        leaderboardEntries = response.data;
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    }

    return {
        props: {
            leaderboardEntries,
        },
    };
};