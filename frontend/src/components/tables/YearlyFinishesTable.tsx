import { YearlyFinishesProps } from "@/components/tables/RtpStatsTypes";
import { Table } from 'react-bootstrap';

const YearlyFinishesTable: React.FC<YearlyFinishesProps> = ({ stats }) => {
    stats.sort((a, b) => b.year - a.year);

    return (
        <div className="container-fluid padding">
            <Table striped responsive="sm" className="text-center">
                <thead>
                <tr>
                    <th scope="col">Year</th>
                    <th scope="col">Winner</th>
                    <th scope="col">Second Place</th>
                    <th scope="col">Third Place</th>
                    <th scope="col">Last Place (Regular Season)</th>
                    <th scope="col">Last Place (Playoffs)</th>
                    <th scope="col">League Size</th>
                </tr>
                </thead>
                <tbody>
                {stats.map((stat) => (
                    <tr key={stat.id}>
                        <td className="v-center">{stat.year}</td>
                        <td className="v-center">{stat.winner}</td>
                        <td className="v-center">{stat.second}</td>
                        <td className="v-center">{stat.third}</td>
                        <td className="v-center">{stat.last_regular}</td>
                        <td className="v-center">{stat.last_playoffs}</td>
                        <td className="v-center">{stat.league_size}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    )
};

export default YearlyFinishesTable;
