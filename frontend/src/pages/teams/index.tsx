import axios from 'axios';
import TeamProfile from '@/components/teams/TeamProfile';
import {Tabs, Tab, Row, Container, Col} from "react-bootstrap";
import Layout from "@/components/global/Layout";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import Header from "@/components/global/Header";
import React from "react";

export interface TeamData {
    teamLogo: string;
    ownerImage: string;
    teamName: string;
    ownerName: string;
    teamMascot: string;
    nationality: string;
    yearsInLeague: number;
    bio: string;
    rival: {
        rivalName: string;
        wins: string;
        losses: string;
        fpts: string;
        fpts_against: string;
    },
    allTimeStats: {
        wins: number;
        playoffAppearances: number;
        pinks: number;
        allTimeRecord: string;
    };
    seasonStats: {
        wins: number;
        losses: number;
        ties: number;
        fpts: number,
        fpts_against: number;
    }
    activeRoster: {
        name: string; // full name
        position: string;
    }[];
}

interface TeamPageProps {
    teamData: TeamData[];
}

const TeamPage = ({ teamData }: TeamPageProps) => {
    return (
        <Layout>
            <RoadToPinkHead title={"Teams"}/>
            <Header title={"Teams"}/>

            <Container>
                <Row>
                    <Col md={12} sm={4}>
                        <Tabs defaultActiveKey="0" id="uncontrolled-tab-example" className="mb-4 custom-tabs">
                            {teamData.map((team, index) => (
                                <Tab eventKey={index.toString()} title={team.teamName} key={index}>
                                    <TeamProfile data={team} />
                                </Tab>
                            ))}
                        </Tabs>
                    </Col>
                </Row>
            </Container>

        </Layout>
    );
};

export default TeamPage;

export const getServerSideProps = async () => {
    try {
        const response = await axios.get<TeamData>(
            `${process.env.API_URL}/api/teams`
        );

        return {
            props: {
                teamData: response.data,
            },
        };
    } catch (error) {
        console.error(error);

        // Return not found if the data could not be fetched
        return {
            notFound: true,
        };
    }
};



