import Layout from "@/components/global/Layout";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import Header from "@/components/global/Header";
import {Col, Container, Row} from "react-bootstrap";
import React from "react";
import {TeamData} from "@/pages/teams";
import Matchups from "@/components/matchups/Matchups";

interface PredictionsProps {
    teamData: TeamData[];
}

const PredictionsPage = ({ teamData }: PredictionsProps) => {
    return (
        <Layout>
            <RoadToPinkHead title={"Predictions"}/>
            <Header title={"Predictions"}/>

            <Container className="px-4 px-lg-5">
                <Row className="gx-4 gx-lg-5 justify-content-center">
                    <Col sm={12} md={6}>
                        Leaderboards
                    </Col>
                    <Col sm={12} md={6}>
                        <Matchups/>
                    </Col>
                </Row>
            </Container>

        </Layout>
    );
};

export default PredictionsPage;