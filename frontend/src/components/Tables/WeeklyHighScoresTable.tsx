import {WeeklyHighScoresProps} from "@/components/Tables/RtpStatsTypes";

const WeeklyHighScoresTable: React.FC<WeeklyHighScoresProps> = ({ stats }) => (
    <div>
        <table>
            <thead>
            <tr>
                <th className="col-1" scope="col">Sleeper User</th>
                <th className="col-1" scope="col">Avatar</th>
                <th className="col-1" scope="col">Score</th>
                <th className="col-1" scope="col">Year</th>
                <th className="col-1" scope="col">Week</th>
            </tr>
            </thead>
            <tbody>
            {stats.map((stat) => (
                <tr key={stat.sleeperUser}>
                    <td>{stat.avatar}</td>
                    <td>{stat.sleeperUser}</td>
                    <td>{stat.score}</td>
                    <td>{stat.year}</td>
                    <td>{stat.week}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default WeeklyHighScoresTable;
