import React from 'react';
import { useState } from 'react'
import Layout from "@/components/global/Layout";
import AllTimeWinnersTable from "@/components/tables/AllTimeWinnersTable";
import {RtpStatsProps} from "@/components/tables/RtpStatsTypes";
import AllTimeStandingsTable from "@/components/tables/AllTimeStandingsTable";
import WeeklyHighScoresTable from "@/components/tables/WeeklyHighScoresTable";
import PlayerHighScoresTable from "@/components/tables/PlayerHighScoresTable";
import YearlyFinishesTable from "@/components/tables/YearlyFinishesTable";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import styles from './index.module.css';
import Header from "@/components/global/Header";

type Tab = 'allTimeWinners' | 'allTimeStandings' | 'weeklyHighScores' | 'playerHighScores' | 'yearlyFinishes';

const Index = ({ statProps }: RtpStatsProps) => {
    console.log("STATS HERE"+ statProps)

    const [tab, setTab] = useState<Tab>('allTimeWinners');

    return (
        <Layout>
            <div>
                <RoadToPinkHead title={"Stats"}/>
                <Header title={"Road To Pink Stats"} subtitle={"Where Peter comes to weep"}/>

                <div className={styles.container + " mt-3"}>
                    <div className={styles.tab + " row text-center"}>
                        <div className="col-md-2 col-sm-12">
                            <button
                                className={`${styles.tab} ${styles.button} ${tab === 'allTimeWinners' ? styles.active : ''}`}
                                onClick={() => setTab('allTimeWinners')}
                            >
                                All-time Winners
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button
                                className={`${styles.tab} ${styles.button} ${tab === 'allTimeStandings' ? styles.active : ''}`}
                                onClick={() => setTab('allTimeStandings')}
                            >
                                All-time Standings
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button
                                className={`${styles.tab} ${styles.button} ${tab === 'weeklyHighScores' ? styles.active : ''}`}
                                onClick={() => setTab('weeklyHighScores')}
                            >
                                All-time Weekly High Scores
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button
                                className={`${styles.tab} ${styles.button} ${tab === 'playerHighScores' ? styles.active : ''}`}
                                onClick={() => setTab('playerHighScores')}
                            >
                                All-time Player High Scores
                            </button>
                        </div>
                        <div className="col-md-2 col-sm-12">
                            <button
                                className={`${styles.tab} ${styles.button} ${tab === 'yearlyFinishes' ? styles.active : ''}`}
                                onClick={() => setTab('yearlyFinishes')}
                            >
                                Yearly Finishes & Legacy Index
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
    const res = await fetch('http://localhost:4001/api/stats');

    const data = await res.json();

    console.log(data)
    console.log(data.statProps)

    // Parse the response data to match your frontend data model
    const statProps = data.statProps;

    // Pass data to the page via props
    return { props: { statProps } };
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
