import React, { useState, useEffect } from "react";
import Navbar from "../../components/sidebar/sidebar";
import './akun.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import profilePic from "../../assets/account.png";
import AccountDeletePopup from "../../components/akun/akun-delete"; // Import the new popup component
import { fetchDataAcc, deleteAccount } from "../../server/api";
import { message } from "antd"; // Import message from Ant Design

export default function Akun() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const navigate = useNavigate();
  const { isLoggedIn, username, logout } = useAuth(); // Get logout from useAuth

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isLoggedIn || !token) {
      navigate('/login');
    } else {
      fetchDataAcc().then(accounts => {
        const account = accounts.find(acc => acc.username === username);
        if (account) {
          setAccountId(account._id);
        }
      }).catch(error => console.error("Failed to fetch account data:", error));
    }
  }, [isLoggedIn, navigate, username]);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(accountId);
      message.success("Akun berhasil dihapus");
      setIsDeletePopupOpen(false);
      logout(); // Call logout after closing the popup
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      message.error("Gagal menghapus akun");
      console.error("Error deleting account:", error);
    }
  };

  return (
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
          <div className="title">Akun</div>
        </div>
        <div className="notifikasi-content-container">
          <div className="notifikasi-content">
            <div className="notifikasi-content-box">
              <div className="notifikasi-content-box-left">
                <img src={profilePic} className="profile-pic" alt="Profile" />
                <div className="notifikasi-content-username">
                  {username}
                </div>
              </div>
              <div className="notifikasi-content-box-right">
                <button className="notifikasi-button" onClick={() => setIsDeletePopupOpen(true)}>Hapus akun</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {isDeletePopupOpen && (
        <AccountDeletePopup
          username={username}
          onClose={() => setIsDeletePopupOpen(false)}
          onDelete={handleDeleteAccount}
        />
      )}
    </div>
  );
}
