import Link from 'next/link';
import {FaBars, FaRoad} from "react-icons/fa"
import {useState} from "react";
import Image from 'next/image'
import rtpLogo from "../assets/rtp_logo_clean.png";

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light navbar-custom sticky-top">
            <div className="container-fluid">
                <Link href="/">
                    <Image
                        src={rtpLogo}
                        width={100}
                        height={100}
                        alt="RTP Logo"
                    />
                </Link>
                <button className="menu-toggle navbar-toggler" type="button"
                        onClick={handleToggle} aria-controls="navbarNav"
                        aria-expanded={isOpen} aria-label="Toggle navigation">
                    <FaBars color={"white"}/>
                </button>
                <div className={`collapse navbar-collapse justify-content-center ${isOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav" id="dynamic-nav">
                        <li className="nav-item">
                            <Link href="/">
                                <span className="nav-link" aria-current="page">Home</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/stats">
                                <span className="nav-link" aria-current="page">Stats</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/upload">
                                <span className="nav-link" aria-current="page">Upload</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/archive">
                                <span className="nav-link" aria-current="page">Archive</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
