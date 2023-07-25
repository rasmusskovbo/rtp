import React, { ReactNode } from 'react';
import Footer from './Footer';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <main className="flex-grow-1">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
