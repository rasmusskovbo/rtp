import {YearlyFinishesProps} from "@/components/Tables/RtpStatsTypes";

const YearlyFinishesTable: React.FC<YearlyFinishesProps> = ({ stats }) => (
    <div>
        <table>
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
                <tr key={stat.year}>
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
