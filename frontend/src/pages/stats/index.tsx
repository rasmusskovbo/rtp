import React from 'react';
import { useState } from 'react'
import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import AllTimeWinnersTable from "@/components/Tables/AllTimeWinnersTable";
import {RtpStatsProps} from "@/components/Tables/RtpStatsTypes";
import AllTimeStandingsTable from "@/components/Tables/AllTimeStandingsTable";
import WeeklyHighScoresTable from "@/components/Tables/WeeklyHighScoresTable";
import PlayerHighScoresTable from "@/components/Tables/PlayerHighScoresTable";
import YearlyFinishesTable from "@/components/Tables/YearlyFinishesTable";
import RoadToPinkHead from "@/components/RoadToPinkHead";
import styles from './index.module.css';
import Header from "@/components/Header";

type Tab = 'allTimeWinners' | 'allTimeStandings' | 'weeklyHighScores' | 'playerHighScores' | 'yearlyFinishes';

const Index = ({ statProps }: RtpStatsProps) => {
    const sampleRtpStatsProps: RtpStatsProps = {
        statProps: {
            allTimeWinners: {
                stats: [
                    {
                        id: 1,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "User123",
                        rtpScore: 89.7,
                        wins: 12,
                        secondPlaces: 3,
                        thirdPlaces: 2,
                        playoffAppearances: 6,
                        toiletBowlWins: 1,
                        pinkFinishes: 0
                    }
                ]
            },
            allTimeStandings: {
                stats: [
                    {
                        id: 1,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "User123",
                        record: 22,
                        winPercent: 67,
                        pointsFor: 1987,
                        pointsAgainst: 1723,
                        difference: 264,
                        transactions: 32,
                        messages: 423
                    }
                ]
            },
            weeklyHighScores: {
                stats: [
                    {
                        id: 1,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "a",
                        score: 120,
                        year: 2023,
                        week: 1,
                    },
                    {
                        id: 2,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "b",
                        score: 120,
                        year: 2023,
                        week: 1,
                    },
                    {
                        id: 3,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "c",
                        score: 120,
                        year: 2023,
                        week: 1,
                    },
                    {
                        id: 4,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "d",
                        score: 120,
                        year: 2023,
                        week: 1,
                    },
                    {
                        id: 5,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "e",
                        score: 120,
                        year: 2023,
                        week: 1,
                    }
                ]
            },
            playerHighScores: {
                stats: [
                    {
                        id: 6,
                        avatar: "https://example.com/path/to/avatar.jpg",
                        sleeperUser: "User123",
                        playerName: "PlayerName123",
                        score: 30,
                        year: 2023,
                        week: 1,
                    }
                ]
            },
            yearlyFinishes: {
                stats: [
                    {
                        id: 1,
                        year: 2023,
                        winner: "User123",
                        secondPlace: "User456",
                        thirdPlace: "User789",
                        lastPlaceRegular: "User000",
                        lastPlacePlayoffs: "User111",
                        leagueSize: 10
                    }
                ]
            },
        }
    }

    const [tab, setTab] = useState<Tab>('allTimeWinners');

    return (
        <Layout>
            <div>
                <RoadToPinkHead title={"Stats"}/>
                <Navbar/>
                <Header title={"Road To Pink Stats"} subtitle={""}/>

                <div className={styles.container + " mt-3"}>
                    <div className={styles.tab + " row text-center"}>
                        <div className="col-md-2 col-sm-12">
                            <button className={`${styles.tab} ${styles.button} ${styles.active}`}
                                    onClick={() => setTab('allTimeWinners')}>All-time Winners
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className={styles.tab + " " + styles.button} onClick={() => setTab('allTimeStandings')}>All-time Standings
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className={styles.tab + " " + styles.button} onClick={() => setTab('weeklyHighScores')}>All-time Weekly High
                                Scores
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className={`${styles.tab} ${styles.button}`}
                                    onClick={() => setTab('playerHighScores')}>All-time Player High
                                Scores
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button className={`${styles.tab} ${styles.button}`} onClick={() => setTab('yearlyFinishes')}>Yearly Finishes &
                                Legacy Index
                            </button>
                        </div>
                    </div>

                    {tab === 'allTimeWinners' && <AllTimeWinnersTable stats={sampleRtpStatsProps.statProps.allTimeWinners.stats} />}
                    {tab === 'allTimeStandings' && <AllTimeStandingsTable stats={sampleRtpStatsProps.statProps.allTimeStandings.stats} />}
                    {tab === 'weeklyHighScores' && <WeeklyHighScoresTable stats={sampleRtpStatsProps.statProps.weeklyHighScores.stats} />}
                    {tab === 'playerHighScores' && <PlayerHighScoresTable stats={sampleRtpStatsProps.statProps.playerHighScores.stats} />}
                    {tab === 'yearlyFinishes' && <YearlyFinishesTable stats={sampleRtpStatsProps.statProps.yearlyFinishes.stats} />}
                </div>

            </div>
        </Layout>
    );
};

export default Index;

/*
export async function getServerSideProps() {
    // Fetch ALL data from your backend (see RtpStatsTypes)
    const res = await fetch('http://localhost:3000/api/stats');
    const rtpScoreStats = await res.json();

    // Pass data to the page via props
    return { props: { rtpScoreStats } };
}

 */

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
