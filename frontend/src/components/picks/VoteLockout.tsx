import React, { useEffect, useState } from 'react';
import {Badge, Spinner} from 'react-bootstrap';
import axios from "axios";

export interface VoteLockoutDetails {
    date: string;
    isVoteLockedOut: boolean;
}

const VoteLockout: React.FC = () => {
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [lockoutDetails, setLockoutDetails] = useState<VoteLockoutDetails | null>(null);

    useEffect(() => {
        const fetchLockoutDetails = async () => {
            try {
                const response = await axios.get(`${process.env.API_URL}/api/matchups/lockout`);
                setLockoutDetails(response.data);
            } catch (error) {
                console.error("Error fetching lockout details:", error);
            }
        };

        fetchLockoutDetails();
    }, []);

    useEffect(() => {
        if (!lockoutDetails) return;

        const interval = setInterval(() => {
            const now = new Date();
            const targetDate = new Date(lockoutDetails.date);
            const diffInSeconds = (targetDate.getTime() - now.getTime()) / 1000;

            if (diffInSeconds <= 0) {
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diffInSeconds / (3600 * 24));
            const hours = Math.floor((diffInSeconds - (days * 3600 * 24)) / 3600);
            const minutes = Math.floor((diffInSeconds - (days * 3600 * 24 + hours * 3600)) / 60);
            const seconds = Math.floor(diffInSeconds % 60);

            setTimeRemaining({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [lockoutDetails]);


    if (!lockoutDetails) {
        return (
            <div className="spinnerContainer">
                <Spinner animation="border" />
            </div>)
    }

    if (lockoutDetails.isVoteLockedOut) {
        return (
            <div className="text-center">
                <hr className="centered-hr" />
                Votes are <span style={{ backgroundColor: 'darkred', color: 'white' }}>locked</span> for this week.
                New matchups will be available in:<br/>
                {timeRemaining.days} days, {timeRemaining.hours} hours, {timeRemaining.minutes} minutes, {timeRemaining.seconds} seconds
                <hr className="centered-hr" />
            </div>
        );
    }

    return (
        <div className="text-center">
            <hr className="centered-hr" />
            Votes are <span style={{ backgroundColor: 'green', color: 'white' }}>open</span>!
            Votes will be closing in:<br/>
            {timeRemaining.days} days, {timeRemaining.hours} hours, {timeRemaining.minutes} minutes, {timeRemaining.seconds} seconds
            <hr className="centered-hr" />
        </div>
    );
};

export default VoteLockout;
