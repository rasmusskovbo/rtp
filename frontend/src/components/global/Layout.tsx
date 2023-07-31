import React, { ReactNode } from 'react';
import Footer from './Footer';
import NavbarComponent from "@/components/global/NavbarComponent";
import {ToastContainer} from "react-toastify";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
        <ToastContainer autoClose={3000} hideProgressBar />
        <div className="d-flex flex-column min-vh-100">
            <NavbarComponent/>
            <main className="flex-grow-1" style={{ paddingTop: '125px' }}>{children}</main> {/* Adjust the paddingTop value to match your Navbar's height */}
            <Footer />
        </div>
        </>
    );

};

export default Layout;
