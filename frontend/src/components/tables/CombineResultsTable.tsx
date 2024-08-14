import React, { useState, useMemo } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { Figure, Table } from 'react-bootstrap';
import {
    GiCheckMark,
    GiSprint,
    GiMuscleUp,
    GiPodium,
    GiGoalKeeper,
    GiGlassBall
} from 'react-icons/gi';
import { LuGrid } from "react-icons/lu";
import { FaPercentage } from "react-icons/fa";
import { BsCupStraw } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

type CombineResultsStats = {
    id: number;
    year: number;
    avatar: string;
    sleeper_username: string;
    total_picks_votes: number;
    total_correct_picks: number;
    flip_cup_time: number;
    beer_pong_score: number;
    grid_score: number;
    sprint_time: number;
    football_goal_hits: number;
    total_push_ups: number;
    football_bucket_hits: number;
    total_combine_score: number;
};

interface CombineResultsProps {
    stats: CombineResultsStats[];
}

const CombineResultsTable: React.FC<CombineResultsProps> = ({ stats }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof CombineResultsStats | 'correct_pick_percentage'; direction: 'ascending' | 'descending' } | null>(null);
    const [selectedYears, setSelectedYears] = useState<number[]>([]);

    // Define the keys for the categories
    const categories: (keyof CombineResultsStats | 'correct_pick_percentage')[] = [
        'correct_pick_percentage', 'total_correct_picks', 'flip_cup_time',
        'beer_pong_score', 'grid_score', 'sprint_time', 'football_goal_hits',
        'total_push_ups', 'football_bucket_hits', 'total_combine_score'
    ];

    // Icons for each category
    const categoryIcons: Record<string, JSX.Element> = {
        'correct_pick_percentage': <FaPercentage color="hotpink" />,
        'total_correct_picks': <GiCheckMark color="hotpink" />,
        'flip_cup_time': <BsCupStraw color="hotpink" />,
        'beer_pong_score': <GiGlassBall color="hotpink" />,
        'grid_score': <LuGrid color="hotpink" />,
        'sprint_time': <GiSprint color="hotpink" />,
        'football_goal_hits': <GiGoalKeeper color="hotpink" />,
        'total_push_ups': <GiMuscleUp color="hotpink" />,
        'football_bucket_hits': <FaRegTrashCan color="hotpink" />,
        'total_combine_score': <GiPodium color="hotpink" />
    };

    const getCorrectPickPercentage = (stat: CombineResultsStats) => {
        return Math.round((stat.total_correct_picks / stat.total_picks_votes) * 1000) / 10 || 0;
    };

    const sortedStats = useMemo(() => {
        let sortableStats = [...stats];
        if (sortConfig !== null) {
            sortableStats.sort((a, b) => {
                const aValue = sortConfig.key === 'correct_pick_percentage' ? getCorrectPickPercentage(a) : a[sortConfig.key];
                const bValue = sortConfig.key === 'correct_pick_percentage' ? getCorrectPickPercentage(b) : b[sortConfig.key];

                if (sortConfig.key === 'flip_cup_time' || sortConfig.key === 'sprint_time' || sortConfig.key === 'grid_score') {
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                } else {
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                }
                return 0;
            });
        }
        return sortableStats;
    }, [stats, sortConfig]);

    const filteredStats = useMemo(() => {
        if (selectedYears.length === 0) {
            return sortedStats;
        }
        return sortedStats.filter(stat => selectedYears.includes(stat.year));
    }, [sortedStats, selectedYears]);

    const requestSort = (key: keyof CombineResultsStats | 'correct_pick_percentage') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof CombineResultsStats | 'correct_pick_percentage') => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <FaArrowUp /> : <FaArrowDown />;
    };

    const topScores = useMemo(() => {
        const statsWithPercentage = filteredStats.map(stat => ({
            ...stat,
            correct_pick_percentage: getCorrectPickPercentage(stat)
        }));

        const tops = categories.reduce((acc, category) => {
            let bestStat = statsWithPercentage[0];
            statsWithPercentage.forEach(stat => {
                if (category === 'flip_cup_time' || category === 'sprint_time' || category === 'grid_score') {
                    if (stat[category] < bestStat[category]) bestStat = stat;
                } else {
                    if (stat[category] > bestStat[category]) bestStat = stat;
                }
            });
            acc[category] = { user: bestStat.sleeper_username, value: bestStat[category] };
            return acc;
        }, {} as Record<string, { user: string; value: string | number }>);

        return tops;
    }, [filteredStats]);

    const yearOptions = useMemo(() => {
        const uniqueYears = Array.from(new Set(stats.map(stat => stat.year)));
        return uniqueYears.map(year => ({ value: year, label: year.toString() }));
    }, [stats]);

    const handleYearChange = (newValue: MultiValue<{ value: number; label: string }>, actionMeta: ActionMeta<{ value: number; label: string }>) => {
        setSelectedYears(newValue.map(option => option.value));
    };

    return (
        <div className="container-fluid padding">
            <div className="row mb-3">
                <div className="col-12">
                    <Select
                        isMulti
                        options={yearOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select years to compare"
                        onChange={handleYearChange}
                    />
                </div>
            </div>
            <div className="row">
                {Object.keys(topScores).map((category, index) => (
                    <div key={index} className="col-md-4 col-sm-6 col-12 mb-3">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">
                                    {categoryIcons[category]} {category.replace(/_/g, ' ').toUpperCase()}
                                </h5>
                                <p className="card-text">{topScores[category].user}</p>
                                <p className="card-text"><strong>{topScores[category].value}</strong></p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Table striped responsive="sm" className="text-center">
                <thead>
                <tr>
                    <th scope="col">Year</th>
                    <th scope="col">Avatar</th>
                    <th scope="col">Sleeper Username</th>
                    <th scope="col" onClick={() => requestSort('total_picks_votes')} style={{color: 'hotpink'}}>Total Picks (amount) {getSortIndicator('total_picks_votes')}</th>
                    <th scope="col" onClick={() => requestSort('total_correct_picks')} style={{color: 'hotpink'}}>Correct Picks (amount) {getSortIndicator('total_correct_picks')}</th>
                    <th scope="col" onClick={() => requestSort('flip_cup_time')} style={{color: 'hotpink'}}>Flip Cup (seconds) {getSortIndicator('flip_cup_time')}</th>
                    <th scope="col" onClick={() => requestSort('beer_pong_score')} style={{color: 'hotpink'}}>Beer Pong Score {getSortIndicator('beer_pong_score')}</th>
                    <th scope="col" onClick={() => requestSort('grid_score')} style={{color: 'hotpink'}}>Grid (score) {getSortIndicator('grid_score')}</th>
                    <th scope="col" onClick={() => requestSort('sprint_time')} style={{color: 'hotpink'}}>100m Sprint Time (seconds) {getSortIndicator('sprint_time')}</th>
                    <th scope="col" onClick={() => requestSort('football_goal_hits')} style={{color: 'hotpink'}}>Football Goal Hits (of 30) {getSortIndicator('football_goal_hits')}</th>
                    <th scope="col" onClick={() => requestSort('total_push_ups')} style={{color: 'hotpink'}}>Push Ups (amount) {getSortIndicator('total_push_ups')}</th>
                    <th scope="col" onClick={() => requestSort('football_bucket_hits')} style={{color: 'hotpink'}}>Football Bucket Hits (of 15) {getSortIndicator('football_bucket_hits')}</th>
                    <th scope="col" onClick={() => requestSort('total_combine_score')} style={{color: 'hotpink'}}>Total Combine Score {getSortIndicator('total_combine_score')}</th>
                </tr>
                </thead>
                <tbody>
                {filteredStats.map((stat) => (
                    <tr key={stat.id}>
                        <td className="v-center">{stat.year}</td>
                        <td>
                            <Figure id="avatar">
                                <Figure.Image
                                    width={32}
                                    height={40}
                                    alt="Avatar"
                                    src={stat.avatar}
                                />
                            </Figure>
                        </td>
                        <td className="v-center">{stat.sleeper_username}</td>
                        <td className="v-center">{stat.total_picks_votes}</td>
                        <td className="v-center">{stat.total_correct_picks}</td>
                        <td className="v-center">{stat.flip_cup_time}</td>
                        <td className="v-center">{stat.beer_pong_score}</td>
                        <td className="v-center">{stat.grid_score}</td>
                        <td className="v-center">{stat.sprint_time}</td>
                        <td className="v-center">{stat.football_goal_hits}</td>
                        <td className="v-center">{stat.total_push_ups}</td>
                        <td className="v-center">{stat.football_bucket_hits}</td>
                        <td className="v-center">{stat.total_combine_score}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
};

export default CombineResultsTable;
