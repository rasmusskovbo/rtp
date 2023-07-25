import { WeeklyHighScoresProps } from "@/components/Tables/RtpStatsTypes";
import styles from './tables.module.css'

const WeeklyHighScoresTable: React.FC<WeeklyHighScoresProps> = ({ stats }) => (
    <div className={`${styles.tabcontent} container-fluid padding`}>
        <table id="weekly-high-table" className="table table-striped table-responsive text-center">
            <thead>
            <tr>
                <th className="col-1" scope="col">Avatar</th>
                <th className="col-1" scope="col">Sleeper User</th>
                <th className="col-2" scope="col">Score</th>
                <th className="col-2" scope="col">Year</th>
                <th className="col-2" scope="col">Week</th>
            </tr>
            </thead>
            <tbody>
            {stats.map((stat) => (
                    <tr key={stat.id}>
                        <td>
                            <img id="avatar" src={stat.avatar} alt="Avatar" />
                        </td>
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


/*

Use this source (that uses bootstrap)
And this css:
To update this table component so that it ends up with the same visual result:

 */