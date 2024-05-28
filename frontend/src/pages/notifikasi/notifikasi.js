import React, { useState, useEffect } from "react";
import Navbar from "../../components/sidebar/sidebar";
import './notifikasi.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";

export default function Notifikasi() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
  const { isLoggedIn, username } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isLoggedIn || !token) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
    return(
        <div className="notifikasi-page-container">
      <Navbar
        className="navbar"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className="notifikasi-page"
        style={{ marginLeft: isSidebarOpen ? "200px" : "60px" }}
      >
        <div className="notifikasi-header">
          <div className="notifikasi-header-element">
            <span className="user">{username}</span>
            <span className="status-ruangan-link" onClick={() => navigate('/status')}>Status Ruangan</span>
          </div>
        </div>
        <div className="title-container">
          <div className="title">Notifikasi</div>
        </div>
        <div className="notifikasi-content-container">
          <div className="notifikasi-content">
            
          </div>
        </div>
      </main>
    </div>
    );
}