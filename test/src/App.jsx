import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from '../src/pages/loginpage';
import Signup from '../src/pages/signup';
import Congratulation from './pages/congratulation';
import Pro from './pages/propage';
import NotificationBar from './pages/notification';
import './App.css';
import { AuthProvider } from './context/AuthContext';


function App() {
 
  return (
    
  
    
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/signup" element= {<Signup />} />
        <Route path="/login" element= {<Login />} />
        <Route path="/congratulation" element= {<Congratulation />} />
        <Route path="/propage" element= {<Pro />} />
       <Route path="/notification" element= {<NotificationBar />} />
      </Routes>
    </Router>
    </AuthProvider> 
      
  )
}

export default App
