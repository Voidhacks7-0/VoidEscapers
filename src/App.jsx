import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Diet from './pages/Diet';
import Consult from './pages/Consult';
import Services from './pages/Services';
import Community from './pages/Community';
import Admin from './pages/Admin';
import Layout from './components/Layout';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="profile-setup" element={<ProfileSetup />} />
            <Route path="profile" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="diet" element={<Diet />} />
            <Route path="consult" element={<Consult />} />
            <Route path="services" element={<Services />} />
            <Route path="community" element={<Community />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
