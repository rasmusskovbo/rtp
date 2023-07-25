import React from 'react';
import { useState } from 'react'
import Layout from "@/components/Layout";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import AllTimeWinnersTable from "@/components/Tables/AllTimeWinnersTable";
import {RtpStatsProps} from "@/components/Tables/RtpStatsTypes";
import AllTimeStandingsTable from "@/components/Tables/AllTimeStandingsTable";
import WeeklyHighScoresTable from "@/components/Tables/WeeklyHighScoresTable";
import PlayerHighScoresTable from "@/components/Tables/PlayerHighScoresTable";
import YearlyFinishesTable from "@/components/Tables/YearlyFinishesTable";

type Tab = 'allTimeWinners' | 'allTimeStandings' | 'weeklyHighScores' | 'playerHighScores' | 'yearlyFinishes';

const Index = ({ statProps }: RtpStatsProps) => {
    const [tab, setTab] = useState<Tab>('allTimeWinners');

    return (
        <Layout>
            <div>
                <Head>
                    <title>Road To Pink - Stats</title>
                    <link rel="icon" href="/assets/favicon.ico" />
                    <link href="https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic" rel="stylesheet" />
                    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800" rel="stylesheet" />
                </Head>

                <Navbar/>

                <div className="container mt-3">
                    <h1>Stats</h1>
                    <div className="tab row text-center">
                        <div className="col-md-2 col-sm-12">
                            <button className="tablinks" onClick={() => setTab('allTimeWinners')}>All-time Winners
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className="tablinks" onClick={() => setTab('allTimeStandings')}>All-time Standings
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className="tablinks" onClick={() => setTab('weeklyHighScores')}>All-time Weekly High
                                Scores
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className="tablinks" onClick={() => setTab('playerHighScores')}>All-time Player High
                                Scores
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className="tablinks" onClick={() => setTab('yearlyFinishes')}>Yearly Finishes &
                                Legacy Index
                            </button>
                        </div>
                    </div>

                    {tab === 'allTimeWinners' && <AllTimeWinnersTable stats={statProps.allTimeWinners.stats} />}
                    {tab === 'allTimeStandings' && <AllTimeStandingsTable stats={statProps.allTimeStandings.stats} />}
                    {tab === 'weeklyHighScores' && <WeeklyHighScoresTable stats={statProps.weeklyHighScores.stats} />}
                    {tab === 'playerHighScores' && <PlayerHighScoresTable stats={statProps.playerHighScores.stats} />}
                    {tab === 'yearlyFinishes' && <YearlyFinishesTable stats={statProps.yearlyFinishes.stats} />}
                </div>

            </div>
        </Layout>
    );
};

export default Index;


export async function getServerSideProps() {
    // Fetch ALL data from your backend (see RtpStatsTypes)
    const res = await fetch('http://localhost:3000/api/stats');
    const rtpScoreStats = await res.json();

    // Pass data to the page via props
    return { props: { rtpScoreStats } };
}

/*
let exampleScore: RtpALlStats[] =
    [
        {
            avatar: "https://example.com/path/to/avatar.jpg",
            sleeperUser: "User123",
            rtpScore: 89.7,
            wins: 12,
            secondPlaces: 3,
            thirdPlaces: 2,
            playoffAppearances: 6,
            toiletBowlWins: 1,
            pinkFinishes: 0
        },
        {
            avatar: "https://example.com/path/to/avatar.jpg",
            sleeperUser: "User123",
            rtpScore: 55.3,
            wins: 2,
            secondPlaces: 4,
            thirdPlaces: 2,
            playoffAppearances: 2,
            toiletBowlWins: 1,
            pinkFinishes: 2
        }
    ];

 */
