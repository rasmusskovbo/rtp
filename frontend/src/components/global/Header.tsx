import React, { FC } from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
}

const Header: FC<HeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="row welcome text-center">
            <div className="col-12">
                <h1 className="display-4">{title}</h1>
            </div>
            <div className="col-12">
                <h4>{subtitle}</h4>
            </div>
            <hr />
        </div>
    );
};

export default Header;
