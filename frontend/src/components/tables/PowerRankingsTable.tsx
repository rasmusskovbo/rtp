import { PowerRankingsProps } from "@/components/tables/RtpStatsTypes";
import { Table, Figure } from 'react-bootstrap';

const PowerRankingsTable: React.FC<PowerRankingsProps> = ({ rankings }) => {
    // Sort by currentRank (ascending - lower rank number is better)
    const sortedRankings = [...rankings].sort((a, b) => a.currentRank - b.currentRank);

    const getRankDifferenceDisplay = (rankDifference?: number) => {
        if (rankDifference === undefined || rankDifference === 0) return '-';
        if (rankDifference > 0) return `+${rankDifference.toFixed(1)}`;
        return rankDifference.toFixed(1);
    };

    const getRankDifferenceClass = (rankDifference?: number) => {
        if (rankDifference === undefined || rankDifference === 0) return '';
        if (rankDifference > 0) return 'text-success'; // Moved up (better)
        return 'text-danger'; // Moved down (worse)
    };

    return (
        <div className="container-fluid padding">
            <Table striped responsive="sm" className="text-center">
                <thead>
                    <tr>
                        <th scope="col">Team Logo</th>
                        <th scope="col">Team Name</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Current Rank</th>
                        <th scope="col">Last Week</th>
                        <th scope="col">Change</th>
                        <th scope="col">Avg Rank</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRankings.map((ranking, index) => {
                        let rowStyle = '';
                        if (index === 0) rowStyle = "first";
                        else if (index === 1) rowStyle = "second";
                        else if (index === 2) rowStyle = "third";
                        else if (index === sortedRankings.length - 1) rowStyle = "last";
                        
                        return (
                            <tr key={ranking.team.id} className={rowStyle}>
                                <td>
                                    <Figure id="avatar">
                                        <Figure.Image
                                            width={32}
                                            height={32}
                                            alt={ranking.team.teamName}
                                            src={ranking.team.teamLogo}
                                            rounded
                                        />
                                    </Figure>
                                </td>
                                <td className="v-center">
                                    <strong>{ranking.team.teamName}</strong>
                                </td>
                                <td className="v-center">{ranking.team.ownerName}</td>
                                <td className="v-center">
                                    <strong>{ranking.currentRank.toFixed(1)}</strong>
                                </td>
                                <td className="v-center">
                                    {ranking.lastWeekRank ? ranking.lastWeekRank.toFixed(1) : '-'}
                                </td>
                                <td className={`v-center ${getRankDifferenceClass(ranking.rankDifference)}`}>
                                    <strong>{getRankDifferenceDisplay(ranking.rankDifference)}</strong>
                                </td>
                                <td className="v-center">{ranking.averageRank.toFixed(1)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
};

export default PowerRankingsTable;