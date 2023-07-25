import {FaFacebookF} from "react-icons/fa";
import {GiAmericanFootballHelmet} from "react-icons/gi";

const Footer = () => {
    return (
        <footer className="bg-light py-3">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-auto">
                        <a href="https://www.facebook.com/groups/526710621293900">
                            <FaFacebookF color="black"/>
                        </a>
                    </div>
                    <div className="col-auto">
                       <a href="https://sleeper.com/leagues/976587245010333696/league">
                            <GiAmericanFootballHelmet color="black"/>
                       </a>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-auto">
                        <p className="text-center">&copy; Wildf1re 2023</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer