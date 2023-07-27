import {AllTimeWinnersProps} from "@/components/tables/RtpStatsTypes";
import {useEffect} from "react";

const AllTimeWinnersTable: React.FC<AllTimeWinnersProps> = ({ stats }) => {
    stats.sort((a, b) => b.rtpScore - a.rtpScore);

    return (<div className={`tabcontent container-fluid padding`}>
        <table className="table table-striped table-responsive text-center">
            <thead>
            <tr>
                <th className="col-1" scope="col">Avatar</th>
                <th className="col-1" scope="col">Sleeper User</th>
                <th className="col-1" scope="col">RTP™ Score</th>
                <th className="col-1" scope="col">Wins</th>
                <th className="col-1" scope="col">Second Places</th>
                <th className="col-1" scope="col">Third Places</th>
                <th className="col-1" scope="col">Playoff Appearances</th>
                <th className="col-1" scope="col">Toilet Bowl Wins</th>
                <th className="col-1" scope="col">Pink Finishes</th>
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
                        <td>{stat.rtpScore}</td>
                        <td>{stat.wins}</td>
                        <td>{stat.second_place}</td>
                        <td>{stat.third_place}</td>
                        <td>{stat.playoff_appearances}</td>
                        <td>{stat.toilet_wins}</td>
                        <td>{stat.pinks}</td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    </div>)
};

export default AllTimeWinnersTable;
