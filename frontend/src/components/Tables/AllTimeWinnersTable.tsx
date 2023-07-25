import {AllTimeWinnersProps} from "@/components/Tables/RtpStatsTypes";

const AllTimeWinnersTable: React.FC<AllTimeWinnersProps> = ({ stats }) => (
    <div>
        <table>
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
            {stats.map((stat) => (
                <tr key={stat.sleeperUser}>
                    <td>{stat.avatar}</td>
                    <td>{stat.sleeperUser}</td>
                    <td>{stat.rtpScore}</td>
                    <td>{stat.wins}</td>
                    <td>{stat.secondPlaces}</td>
                    <td>{stat.thirdPlaces}</td>
                    <td>{stat.playoffAppearances}</td>
                    <td>{stat.toiletBowlWins}</td>
                    <td>{stat.pinkFinishes}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default AllTimeWinnersTable;