import React, { useState, useEffect } from "react";
import { CircleAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../../../authContext'; // Import useAuth dari AuthContext
import "./login-form.css";
import { Input } from "../login-input/login-input";
import { Button } from "../login-button/login-button";
import visibilityOn from "../../../assets/login/visibility.svg";
import visibilityOff from "../../../assets/login/visibility_off.svg";
import { login as apiLogin } from "../../../server/api"; // Import fungsi login dari API.js

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginContext, logout: logoutContext } = useAuth(); // Gunakan login dan logout dari context

  useEffect(() => {
    // Cek apakah pengguna datang dari halaman "Peminjaman"
    if (location.state?.from?.pathname === '/peminjaman') {
      logoutContext();
    }
  }, [location, logoutContext]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await apiLogin(formData.username, formData.password);
      console.log("Login berhasil:", data.message);
      setFormData({ username: "", password: "" });
      setError("");
      loginContext(data.token, formData.username); // Set context login dengan token dan username
      navigate('/peminjaman');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="field">
        <span>Username</span>
        <Input
          type="input"
          name="username"
          value={formData.username}
          placeholder="Fill username"
          onChange={handleInputChange}
        />
      </div>
      <div className="field">
        <span>Password</span>
        <div className="password-input-container">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            placeholder="Fill password"
            className="password-input"
            onChange={handleInputChange}
          />
          <div className="container-password-toggle-icon">
            <img
              src={showPassword ? visibilityOn : visibilityOff}
              alt="Toggle password visibility"
              onClick={togglePasswordVisibility}
              className="password-toggle-icon"
            />
          </div>
        </div>
      </div>
      {error && (
        <div className="login-field-error">
          <CircleAlert size="14" color='red'/>
          <span className="error-message">{error}</span>
        </div>
      )}
      <div className="field">
        <Button />
      </div>
    </form>
  );
};
