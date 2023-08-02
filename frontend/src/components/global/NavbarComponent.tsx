import { useState, useContext } from "react";
import Image from 'next/image';
import rtpLogo from "@/assets/rtp_logo_clean.png";
import { Navbar, Nav } from 'react-bootstrap';
import { FaBars } from "react-icons/fa";
import LoginPopup from "@/components/upload/LoginPopup";
import {AuthContext } from '../../auth/AuthProvider';

const NavbarComponent: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [show, setShow] = useState(false);
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext is undefined");
    }

    const { loggedInUser } = authContext;
    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const uploadOnClick = loggedInUser ? () => { window.location.href='/upload' } : handleShow;

    return (
        <>
            <LoginPopup show={show} handleShow={handleShow} handleClose={handleClose} />
            <Navbar expand="sm" bg="light" fixed="top">
                <Navbar.Brand href="/">
                    <Image
                        src={rtpLogo}
                        width={80}
                        height={80}
                        alt="RTP Logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle style={{border: "none"}} aria-controls="basic-navbar-nav" onClick={handleToggle}>
                    <FaBars color={"hotpink"} size={"30"}/>
                </Navbar.Toggle>
                <Navbar.Collapse id="basic-navbar-nav" className={isOpen ? 'show' : ''}>
                    <Nav className="mr-auto">
                        <Nav.Item>
                            <Nav.Link href="/">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/stats">Stats</Nav.Link>
                        </Nav.Item>
                        <Nav.Item onClick={uploadOnClick}>
                            <Nav.Link>Upload</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/archive">Archive</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    )
}

export default NavbarComponent;
