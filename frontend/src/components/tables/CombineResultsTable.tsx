import React, { useMemo } from 'react';
import {Figure, Table} from 'react-bootstrap';

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
    const categories: (keyof CombineResultsStats)[] = [
        'total_picks_votes', 'total_correct_picks', 'flip_cup_time',
        'grid_score', 'sprint_time', 'football_goal_hits',
        'total_push_ups', 'football_bucket_hits', 'total_combine_score'
    ];

    // Compute top scores and corresponding users
    const topScores = useMemo(() => {
        const tops = categories.reduce((acc, category) => {
            let bestStat = stats[0];
            stats.forEach(stat => {
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
                                <h5 className="card-title">{category.replace(/_/g, ' ').toUpperCase()}</h5>
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
