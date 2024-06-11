import React from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";
import logosiparuaa from "../../assets/logo_siparuaaa.png";

const Header = () => {
  const navigate = useNavigate();

  const handleBerandaLinkClick = () => {
    navigate('/');
  };

  const handleKalendarLinkClick = () => {
    navigate('/jadwal');
  };

  const handleStatusLinkClick = () => {
    navigate('/status');
  };

  const handleLoginLinkClick = () => {
    navigate('/login'); // Assuming this should navigate to '/login' instead of '/status'
  };

  return (
    <div className="header-component">
      <div className="lambang">
        <img src={logosiparuaa} alt="Logo Siparuaa" />
      </div>
      <div className="nav-menu">
        <ul>
          <li>
            <button className="nav-beranda" onClick={handleBerandaLinkClick}>
              <p>Beranda</p>
            </button>
          </li>
          <li>
            <button className="nav-kalender" onClick={handleKalendarLinkClick}>
              <p>Kalender Peminjaman</p>
            </button>
          </li>
          <li className="nav-status">
            <button onClick={handleStatusLinkClick}>
              <p>Status Peminjaman</p>
            </button>
          </li>
          <li className="nav-admin">
            <button onClick={handleLoginLinkClick}>
              <p>Log In</p>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;