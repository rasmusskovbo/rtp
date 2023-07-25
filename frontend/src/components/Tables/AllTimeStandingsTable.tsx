import {AllTimeStandingsProps} from "@/components/Tables/RtpStatsTypes";
import styles from './tables.module.css';

const AllTimeStandingsTable: React.FC<AllTimeStandingsProps> = ({ stats }) => {
    stats.sort((a, b) => {
        const winPercentDifference = b.win_p - a.win_p
        if (winPercentDifference == 0) {
            return b.diff - a.diff;
        } else {
            return winPercentDifference
        }
    });


    return (
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
                {stats.map((stat, index) => {
                    let rowStyle = '';
                    if (index === 0) rowStyle = "first";
                    else if (index === 1) rowStyle = "second";
                    else if (index === 2) rowStyle = "third";
                    else if (index === stats.length - 1) rowStyle = "last";
                    return (
                    <tr key={stat.id} className={rowStyle}>
                        <td>
                            <img id="avatar" src={stat.avatar} alt="Avatar"/>
                        </td>
                        <td>{stat.sleeper_username}</td>
                        <td>{stat.record}</td>
                        <td>{stat.win_p}</td>
                        <td>{stat.pf}</td>
                        <td>{stat.pa}</td>
                        <td>{stat.diff}</td>
                        <td>{stat.trans}</td>
                        <td>{stat.msgs}</td>
                    </tr>
                );
                })}
                </tbody>
            </table>
        </div>
    )
};

export default AllTimeStandingsTable;
