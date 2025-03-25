import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Logout} from './pages/logoutpage';
import Login from '../src/pages/loginpage';
import Signup from '../src/pages/signup';
import Congratulation from './pages/congratulation';
import Dashboard from './pages/propage';
import NotificationBar from './pages/notification';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import AdminPanel from './pages/pannelAdmin';
import PendingValidation  from './pages/pending';
import ProtectedRoute from '../src/ui/Components/protected';
import UnauthorizedRedirect from '../src/ui/Components/unauthrized';

    
  
    
    function App() {
      return (
        <AuthProvider>
      <Router>
        <Routes>
          {/* Prevent logged-in users from accessing login/signup */}
          <Route element={<UnauthorizedRedirect />}>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected Routes (Only authenticated users can access) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/congratulation" element={<Congratulation />} />
            <Route path="/propage" element={<Dashboard/>} />
            <Route path="/notification" element={<NotificationBar />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/pendingvalidation" element={<PendingValidation />} />

          </Route>

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
      );
    }
    
export default App
