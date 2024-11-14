import './App.css';
import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ComicInfo from './components/ComicInfo';
import Home from './components/Home';
import Footer from './components/Footer';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Check if a user is logged in from previous sessions
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      setLoggedInUser(user);
    }
  }, []);

  const handleLogin = (username) => {
    setLoggedInUser(username);
    localStorage.setItem('loggedInUser', username); // Set the logged-in user in localStorage
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser'); // Clear the logged-in user from localStorage
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/login" element={loggedInUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={loggedInUser ? <Navigate to="/" /> : <Register />} />
            <Route path="/comics/:id" element={loggedInUser ? <ComicInfo /> : <Navigate to="/login" />} />
            <Route path="/" element={loggedInUser ? <Home username={loggedInUser} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
