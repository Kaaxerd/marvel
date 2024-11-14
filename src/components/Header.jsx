import './Header.css';

import React from 'react';
import { Link } from 'react-router-dom';
import App from '../App';

const Header = () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    const handleLogout = () => {
        App.handleLogout();
    };

    return (
        <header>
            <h1>
                <Link to="/">CollecMarvel</Link>
            </h1>
            <nav>
                {loggedInUser ? (
                    <>
                        <span>Welcome, {loggedInUser}.</span>
                        <Link to="/" onClick={handleLogout}>Logout</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;