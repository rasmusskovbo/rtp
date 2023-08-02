import React, { useState, useEffect, createContext, ReactNode } from 'react';

interface User {
    name: string;
}

interface AuthContextProps {
    loggedInUser: User | null;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextProps>({
    loggedInUser: null,
    setIsLoggedIn: () => {},
    loading: true,
    setLoading: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check local storage for user on initial load
    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) {
            setIsLoggedIn(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ loggedInUser: isLoggedIn, setIsLoggedIn, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

