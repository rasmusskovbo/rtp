import { WeeklyHighScoresProps } from "@/components/tables/RtpStatsTypes";
import { Table, Figure } from 'react-bootstrap';

const WeeklyHighScoresTable: React.FC<WeeklyHighScoresProps> = ({ stats }) => {
    stats.sort((a, b) => b.score - a.score);

    return (
        <div className="container-fluid padding">
            <Table id="weekly-high-table" striped responsive="sm" className="text-center">
                <thead>
                <tr>
                    <th scope="col">Avatar</th>
                    <th scope="col">Sleeper User</th>
                    <th scope="col">Score</th>
                    <th scope="col">Year</th>
                    <th scope="col">Week</th>
                </tr>
                </thead>
                <tbody>
                {stats.map((stat, index) => {
                    let rowStyle = '';
                    if (index === 0) rowStyle = "first";
                    else if (index === 1) rowStyle = "second";
                    else if (index === 2) rowStyle = "third";
                    else if (index === stats.length - 1) rowStyle = "last";
                    return (
                        <tr key={stat.id} className={rowStyle}>
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
                            <td className="v-center">{stat.score}</td>
                            <td className="v-center">{stat.year}</td>
                            <td className="v-center">{stat.week}</td>
                        </tr>
                    );
                })}
                </tbody>
            </Table>
        </div>
    )
};

export default WeeklyHighScoresTable;
