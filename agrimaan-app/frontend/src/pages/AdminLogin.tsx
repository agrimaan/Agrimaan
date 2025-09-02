// File: /media/onlinepractice/cold-data/Agrimaan/agrimaan-app/frontend/src/pages/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        if (username === 'admin' && password === 'password') {
            navigate('/admin-dashboard');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div>
            <h1>Admin Login</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default AdminLogin;

