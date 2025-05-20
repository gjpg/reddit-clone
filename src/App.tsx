import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Callback from './components/Callback/Callback'; // Make sure this file exists

function App() {
  useEffect(() => {
    console.log('App mounts');

    return () => console.log('App unmounts');
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/callback" Component={Callback} />
        <Route path="/" element={<div>Home Page</div>} />
        {/* You can add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;
