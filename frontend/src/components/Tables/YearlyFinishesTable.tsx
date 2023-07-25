import {YearlyFinishesProps} from "@/components/Tables/RtpStatsTypes";
import styles from "@/components/Tables/tables.module.css";

const YearlyFinishesTable: React.FC<YearlyFinishesProps> = ({ stats }) => (
    <div className={`${styles.tabcontent} container-fluid padding`}>
        <table className="table table-striped table-responsive text-center">
            <thead>
            <tr>
                <th className="col-1" scope="col">Year</th>
                <th className="col-1" scope="col">Winner</th>
                <th className="col-1" scope="col">Second Place</th>
                <th className="col-1" scope="col">Third Place</th>
                <th className="col-1" scope="col">Last Place (Regular Season)</th>
                <th className="col-1" scope="col">Last Place (Playoffs)</th>
                <th className="col-1" scope="col">League Size</th>
            </tr>
            </thead>
            <tbody>
            {stats.map((stat) => (
                <tr key={stat.id}>
                    <td>{stat.year}</td>
                    <td>{stat.winner}</td>
                    <td>{stat.secondPlace}</td>
                    <td>{stat.thirdPlace}</td>
                    <td>{stat.lastPlaceRegular}</td>
                    <td>{stat.lastPlacePlayoffs}</td>
                    <td>{stat.leagueSize}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default YearlyFinishesTable;
