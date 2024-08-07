import { CombineResultsProps } from "@/components/tables/RtpStatsTypes";
import { Table } from 'react-bootstrap';

const CombineResultsTable: React.FC<CombineResultsProps> = ({ stats }) => {
    stats.sort((a, b) => b.year - a.year);

    return (
        <div className="container-fluid padding">
            <Table striped responsive="sm" className="text-center">
                <thead>
                <tr>
                    <th scope="col">Year</th>
                    <th scope="col">Sleeper Username</th>
                    <th scope="col">Total Picks Votes</th>
                    <th scope="col">Total Correct Picks</th>
                    <th scope="col">Flip Cup Time</th>
                    <th scope="col">Grid Score</th>
                    <th scope="col">Sprint Time</th>
                    <th scope="col">Football Goal Hits</th>
                    <th scope="col">Total Push Ups</th>
                    <th scope="col">Football Bucket Hits</th>
                    <th scope="col">Total Combine Score</th>
                </tr>
                </thead>
                <tbody>
                {stats.map((stat) => (
                    <tr key={stat.id}>
                        <td className="v-center">{stat.year}</td>
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
    )
};

export default CombineResultsTable;
