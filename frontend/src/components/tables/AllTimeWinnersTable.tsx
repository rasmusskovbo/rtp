import { AllTimeWinnersProps } from "@/components/tables/RtpStatsTypes";
import { Table, Figure } from 'react-bootstrap';

const AllTimeWinnersTable: React.FC<AllTimeWinnersProps> = ({ stats }) => {
    stats.sort((a, b) => b.rtpScore - a.rtpScore);

    return (
        <div className="container-fluid padding">
            <Table striped responsive="sm" className="text-center">
                <thead>
                <tr>
                    <th scope="col">Avatar</th>
                    <th scope="col">Sleeper User</th>
                    <th scope="col">RTP™ Score</th>
                    <th scope="col">Wins</th>
                    <th scope="col">Second Places</th>
                    <th scope="col">Third Places</th>
                    <th scope="col">Playoff Appearances</th>
                    <th scope="col">Toilet Bowl Wins</th>
                    <th scope="col">Pink Finishes</th>
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
                                        alt=""
                                        src={stat.avatar}
                                    />
                                </Figure>
                            </td>
                            <td className="v-center">{stat.sleeper_username}</td>
                            <td className="v-center">{stat.rtpScore}</td>
                            <td className="v-center">{stat.wins}</td>
                            <td className="v-center">{stat.second_place}</td>
                            <td className="v-center">{stat.third_place}</td>
                            <td className="v-center">{stat.playoff_appearances}</td>
                            <td className="v-center">{stat.toilet_wins}</td>
                            <td className="v-center">{stat.pinks}</td>
                        </tr>
                    );
                })}
                </tbody>
            </Table>
        </div>
    )
};

export default AllTimeWinnersTable;
