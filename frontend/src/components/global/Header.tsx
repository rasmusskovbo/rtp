import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    return (
        <Container className="welcome text-center">
            <Row>
                <Col>
                    <h1 className="display-4">{title}</h1>
                </Col>
            </Row>
            {subtitle && (
                <Row>
                    <Col>
                        <h4>{subtitle}</h4>
                    </Col>
                </Row>
            )}
            <hr className="centered-hr" />
        </Container>
    );
};

export default Header;
