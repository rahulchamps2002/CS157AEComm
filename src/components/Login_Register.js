import React, { useState } from 'react';
import './styles.css'; 

function Login_Register({ setLoggedInUserId }) {
    const [isLogin, setIsLogin] = useState(true);

    const toggle = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="auth-container">
            {isLogin ? (
                <Login setLoggedInUserId={setLoggedInUserId} />
            ) : (
                <Register />
            )}
            <div className="button-container">
                <button onClick={toggle} className="switch-button">
                    {isLogin ? 'Don\'t have an account? Register here.' : 'Already have an account? Login here.'}
                </button>
            </div>
        </div>
    );
}

function Login({ setLoggedInUserId }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (response.ok) {
            setLoggedInUserId(result.user.User_ID);
            alert('Logged in successfully');
        } else {
            alert(result.message);
        }
    };

    return (
        <form onSubmit={handleLogin} className="login-form">
            <div className="form-header">
                <h2>User Login</h2>
            </div>
            <div className="form-group">
                <input
                    type="email"
                    id="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="User Email"
                    required
                    className="input"
                />
            </div>
            <div className="form-group">
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="input"
                />
            </div>
            <button type="submit" className="login-button">Login</button>
        </form>
    );
}

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();
        if (response.ok) {
            alert('Registration successful!');
            setName('');
            setEmail('');
            setPassword('');
        } else {
            alert(result.message);
        }
    };

    return (
        <form onSubmit={handleRegister} className="login-form">
            <div className="form-header">
                <h2>Create an Account</h2>
            </div>
            <div className="form-group">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                    className="input"
                />
            </div>
            <div className="form-group">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="input"
                />
            </div>
            <div className="form-group">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="input"
                />
            </div>
            <button type="submit" className="register-button">Register</button>
        </form>
    );
}

export default Login_Register;