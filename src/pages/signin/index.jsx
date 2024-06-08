import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../../config/config_fb";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./signin.css";

export const Signin = () => {
        const [username, setUsername] = useState('')
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [error, setError] = useState('');
        const navigate = useNavigate(); // Initialize useNavigate

        const handleSignIn = async (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                console.log(result);

                const userRef = doc(db, "User", result.user.uid);
                await setDoc(userRef, {
                    username: username,
                    email: email,
                });

                navigate('/');
            } catch (error) {
                setError(error.message);
            }
        };

        return (
            <div className="signUp-grid-container">
                <div className="signUp-top-right">
                    <div className="signUp-page">
                        <p>Create a new account</p>
                        <form className="signUp-form" onSubmit={handleSignIn}>
                            <div className="signUp-form-group">
                                <label className="signUp-form-label">Username:</label>
                                <input
                                    type="username"
                                    className="signUp-form-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="signUp-form-group">
                                <label className="signUp-form-label">Email:</label>
                                <input
                                    type="email"
                                    className="signUp-form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="signUp-form-group">
                                <label className="signUp-form-label">Password:</label>
                                <input
                                    type="password"
                                    className="signUp-form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="signUp-form-group">
                                <label className="signUp-form-label">Confirm Password:</label>
                                <input
                                    type="password"
                                    className="signUp-form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="signUp-error-message">{error}</p>}
                            <div className="signUp-button-container">
                                <button className="signUp-button-signup" type="submit">
                                    Sign Up
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
;