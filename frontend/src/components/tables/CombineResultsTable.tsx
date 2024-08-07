import React, { useMemo } from 'react';
import { Figure, Table } from 'react-bootstrap';
import {
    GiTrophy,
    GiCheckMark,
    GiClockwork,
    GiSprint,
    GiSoccerBall,
    GiMuscleUp,
    GiAmericanFootballPlayer,
    GiPodium,
    GiGoalKeeper
} from 'react-icons/gi';
import {LuGrid} from "react-icons/lu";
import {FaPercentage} from "react-icons/fa";
import {BsCupStraw} from "react-icons/bs";
import {FaRegTrashCan} from "react-icons/fa6";

type CombineResultsStats = {
    id: number;
    year: number;
    avatar: string;
    sleeper_username: string;
    total_picks_votes: number;
    total_correct_picks: number;
    flip_cup_time: number;
    grid_score: number;
    sprint_time: number;
    football_goal_hits: number;
    total_push_ups: number;
    football_bucket_hits: number;
    total_combine_score: number;
};

interface CombineResultsProps {
    stats: CombineResultsStats[];
}

const CombineResultsTable: React.FC<CombineResultsProps> = ({ stats }) => {
    // Sort stats by year in descending order
    stats.sort((a, b) => b.year - a.year);

    // Define the keys for the categories
    const categories: (keyof CombineResultsStats | 'correct_pick_percentage')[] = [
        'correct_pick_percentage', 'total_correct_picks', 'flip_cup_time',
        'grid_score', 'sprint_time', 'football_goal_hits',
        'total_push_ups', 'football_bucket_hits', 'total_combine_score'
    ];

    // Icons for each category
    const categoryIcons: Record<string, JSX.Element> = {
        'correct_pick_percentage': <FaPercentage color="hotpink"/>,
        'total_correct_picks': <GiCheckMark color="hotpink"/>,
        'flip_cup_time': <BsCupStraw color="hotpink"/>,
        'grid_score': <LuGrid color="hotpink"/>,
        'sprint_time': <GiSprint color="hotpink"/>,
        'football_goal_hits': <GiGoalKeeper color="hotpink"/>,
        'total_push_ups': <GiMuscleUp color="hotpink"/>,
        'football_bucket_hits': <FaRegTrashCan color="hotpink"/>,
        'total_combine_score': <GiPodium color="hotpink"/>
    };

    // Compute top scores and corresponding users
    const topScores = useMemo(() => {
        const statsWithPercentage = stats.map(stat => ({
            ...stat,
            correct_pick_percentage: Math.round((stat.total_correct_picks / stat.total_picks_votes) * 1000) / 10 || 0
        }));

        const tops = categories.reduce((acc, category) => {
            let bestStat = statsWithPercentage[0];
            statsWithPercentage.forEach(stat => {
                if (category === 'flip_cup_time' || category === 'sprint_time' || category === 'grid_score') {
                    if (stat[category] < bestStat[category]) bestStat = stat;
                } else {
                    if (stat[category] > bestStat[category]) bestStat = stat;
                }
            });
            acc[category] = { user: bestStat.sleeper_username, value: bestStat[category] };
            return acc;
        }, {} as Record<string, { user: string; value: string | number }>);

        return tops;
    }, [stats]);

    return (
        <div className="container-fluid padding">
            <div className="row">
                {Object.keys(topScores).map((category, index) => (
                    <div key={index} className="col-md-4 col-sm-6 col-12 mb-3">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">
                                    {categoryIcons[category]} {category.replace(/_/g, ' ').toUpperCase()}
                                </h5>
                                <p className="card-text">{topScores[category].user}</p>
                                <p className="card-text"><strong>{topScores[category].value}</strong></p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Table striped responsive="sm" className="text-center">
                <thead>
                <tr>
                    <th scope="col">Year</th>
                    <th scope="col">Avatar</th>
                    <th scope="col">Sleeper Username</th>
                    <th scope="col">Total Picks (amount)</th>
                    <th scope="col">Correct Picks (amount)</th>
                    <th scope="col">Flip Cup (seconds)</th>
                    <th scope="col">Grid (score)</th>
                    <th scope="col">Sprint Time (seconds)</th>
                    <th scope="col">Football Goal Hits (of 30)</th>
                    <th scope="col">Push Ups (amount)</th>
                    <th scope="col">Football Bucket Hits (of 15)</th>
                    <th scope="col">Total Combine Score</th>
                </tr>
                </thead>
                <tbody>
                {stats.map((stat) => (
                    <tr key={stat.id}>
                        <td className="v-center">{stat.year}</td>
                        <td>
                            <Figure id="avatar">
                                <Figure.Image
                                    width={32}
                                    height={40}
                                    alt="Avatar"
                                    src={stat.avatar}
                                />
                            </Figure>
                        </td>
                        <td className="v-center">{stat.sleeper_username}</td>
                        <td className="v-center">{stat.total_picks_votes}</td>
                        <td className="v-center">{stat.total_correct_picks}</td>
                        <td className="v-center">{stat.flip_cup_time}</td>
                        <td className="v-center">{stat.grid_score}</td>
                        <td className="v-center">{stat.sprint_time}</td>
                        <td className="v-center">{stat.football_goal_hits}</td>
                        <td className="v-center">{stat.total_push_ups}</td>
                        <td className="v-center">{stat.football_bucket_hits}</td>
                        <td className="v-center">{stat.total_combine_score}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
};

export default CombineResultsTable;
