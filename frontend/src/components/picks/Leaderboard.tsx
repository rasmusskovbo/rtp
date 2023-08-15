import React from 'react';
import { Table } from 'react-bootstrap';
export interface LeaderboardEntry {
    username: string;
    correctPicks: number;
    totalVotes: number;
}

export interface LeaderboardProps {
    leaderboardEntries: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardEntries }) => {
    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Correct Picks</th>
                <th>Total Votes</th>
                <th>Score (%)</th> {/* Added this new header */}
            </tr>
            </thead>
            <tbody>
            {leaderboardEntries.map((entry, index) => {
                const percentage = entry.totalVotes ? Math.round((entry.correctPicks / entry.totalVotes) * 100) : 0;

                return (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{entry.username}</td>
                        <td>{entry.correctPicks}</td>
                        <td>{entry.totalVotes}</td>
                        <td>{percentage}</td>
                    </tr>
                );
            })}
            </tbody>
        </Table>
    );
};


export default Leaderboard;
