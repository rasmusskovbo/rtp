import {YearlyFinishesProps} from "@/components/tables/RtpStatsTypes";
import styles from "@/components/tables/tables.module.css";

const YearlyFinishesTable: React.FC<YearlyFinishesProps> = ({ stats }) => {
    stats.sort((a, b) => b.year - a.year);

    return (
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
                    <td>{stat.second}</td>
                    <td>{stat.third}</td>
                    <td>{stat.last_regular}</td>
                    <td>{stat.last_playoffs}</td>
                    <td>{stat.league_size}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    )
};

export default YearlyFinishesTable;
