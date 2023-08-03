import { AllTimeStandingsProps } from "@/components/tables/RtpStatsTypes";
import { Table, Figure } from 'react-bootstrap';

const AllTimeStandingsTable: React.FC<AllTimeStandingsProps> = ({ stats }) => {
    stats.sort((a, b) => {
        const winPercentDifference = b.win_p - a.win_p;
        if (winPercentDifference === 0) {
            return b.diff - a.diff;
        } else {
            return winPercentDifference;
        }
    });

    return (
        <div className="container-fluid padding">
            <Table striped responsive="sm" className="text-center">
                <thead>
                <tr>
                    <th scope="col">Avatar</th>
                    <th scope="col">Sleeper User</th>
                    <th scope="col">Record</th>
                    <th scope="col">Win %</th>
                    <th scope="col">PF</th>
                    <th scope="col">PA</th>
                    <th scope="col">Diff.</th>
                    <th scope="col">Trans.</th>
                    <th scope="col">Msgs.</th>
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
                            <td className="v-center">{stat.record}</td>
                            <td className="v-center">{stat.win_p}</td>
                            <td className="v-center">{stat.pf}</td>
                            <td className="v-center">{stat.pa}</td>
                            <td className="v-center">{stat.diff}</td>
                            <td className="v-center">{stat.trans}</td>
                            <td className="v-center">{stat.msgs}</td>
                        </tr>
                    );
                })}
                </tbody>
            </Table>
        </div>
    )
};

export default AllTimeStandingsTable;
