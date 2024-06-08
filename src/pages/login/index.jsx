import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../../config/config_fb";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./login.css";

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const signInWithEmail = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);

            navigate('/home');

        } catch (error) {
            setError(error.message);
        }
    };

    const goToSignIn = () => {
        navigate('/sign-in');
    };

    return (
        <div className="log-grid-container">
            <div className="log-top-right">
                <div className="log-login-page">
                    <p>To continue, sign in with an Email Account</p>
                    <form className="log-form" onSubmit={signInWithEmail}>
                        <div className="log-form-group">
                            <label className="log-form-label">Email:</label>
                            <input
                                type="email"
                                className="log-form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="log-form-group">
                            <label className="log-form-label">Password:</label>
                            <input
                                type="password"
                                className="log-form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="log-error-message">{error}</p>}
                        <div className="log-button-container">
                            <button className="log-button-login" type="submit">
                                Log in
                            </button>
                            <button className="log-button-signup" type="button" onClick={goToSignIn}>
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};