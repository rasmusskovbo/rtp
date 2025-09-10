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
    const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
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

    const uploadOnClick = () => {
        if (loggedInUser) {
            window.location.href = '/upload';
        } else {
            setRedirectAfterLogin('/upload');
            handleShow();
        }
    };

    const powerRankingsOnClick = () => {
        if (loggedInUser) {
            window.location.href = '/powerrankings';
        } else {
            setRedirectAfterLogin('/powerrankings');
            handleShow();
        }
    };

    const handleLoginSucces = () => {
        setTimeout(() => {
            window.location.href = redirectAfterLogin ?? '/';
        }, 1000);
    }

    return (
        <>
            <LoginPopup show={show} handleShow={handleShow} handleClose={handleClose} handleLoginSuccess={handleLoginSucces}/>
            <Navbar expand="sm" bg="light" fixed="top">
                <Navbar.Brand href="/">
                    <Image
                        className="hover-grow"
                        src={rtpLogo}
                        width={80}
                        height={80}
                        alt="RTP Logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle style={{border: "none"}} aria-controls="basic-navbar-nav" onClick={handleToggle}>
                    <FaBars className="hover-grow" color={"hotpink"} size={"30"}/>
                </Navbar.Toggle>
                <Navbar.Collapse id="basic-navbar-nav" className={isOpen ? 'show' : ''}>
                    <Nav className="mr-auto">
                        <Nav.Item>
                            <Nav.Link className={isOpen ? 'collapsed-hover-grow' : 'hover-grow'} href="/">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link className={isOpen ? 'collapsed-hover-grow' : 'hover-grow'} href="/teams">Teams</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link className={isOpen ? 'collapsed-hover-grow' : 'hover-grow'} href="/picks">Picks</Nav.Link>
                        </Nav.Item>
                        <Nav.Item onClick={powerRankingsOnClick}>
                            <Nav.Link className={isOpen ? 'collapsed-hover-grow' : 'hover-grow'}>Power Rankings</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link className={isOpen ? 'collapsed-hover-grow' : 'hover-grow'} href="/stats">Stats</Nav.Link>
                        </Nav.Item>
                        <Nav.Item onClick={uploadOnClick}>
                            <Nav.Link className={isOpen ? 'collapsed-hover-grow' : 'hover-grow'}>Upload</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link className={isOpen ? 'collapsed-hover-grow' : 'hover-grow'} href="/archive">Archive</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    )
}

export default NavbarComponent;
