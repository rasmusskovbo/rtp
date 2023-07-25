import {AllTimeStandingsProps} from "@/components/Tables/RtpStatsTypes";
import styles from './tables.module.css';

const AllTimeStandingsTable: React.FC<AllTimeStandingsProps> = ({ stats }) => (
    <div className={`${styles.tabcontent} container-fluid padding`}>
        <table className="table table-striped table-responsive text-center">
            <thead>
            <tr>
                <th className="col-1" scope="col">Avatar</th>
                <th className="col-1" scope="col">Sleeper User</th>
                <th className="col-1" scope="col">Record</th>
                <th className="col-1" scope="col">Win %</th>
                <th className="col-1" scope="col">PF</th>
                <th className="col-1" scope="col">PF</th>
                <th className="col-1" scope="col">Diff.</th>
                <th className="col-1" scope="col">Trans.</th>
                <th className="col-1" scope="col">Msgs.</th>
            </tr>
            </thead>
            <tbody>
            {stats.map((stat) => (
                <tr key={stat.id}>
                    <td>{stat.avatar}</td>
                    <td>{stat.sleeperUser}</td>
                    <td>{stat.record}</td>
                    <td>{stat.winPercent}</td>
                    <td>{stat.pointsFor}</td>
                    <td>{stat.pointsAgainst}</td>
                    <td>{stat.difference}</td>
                    <td>{stat.transactions}</td>
                    <td>{stat.messages}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default AllTimeStandingsTable;
