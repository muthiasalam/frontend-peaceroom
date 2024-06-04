import React, { useState } from "react";
import { Input, message } from "antd";
import "./akun-delete.css";

const AccountDeletePopup = ({ username, onClose, onDelete }) => {
  const [inputUsername, setInputUsername] = useState("");
  const [error, setError] = useState("");

  const handleDelete = () => {
    if (inputUsername === username) {
      onDelete();
    } else {
      setError("Nama pengguna salah");
    }
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <div className="popup-header">
          <p className="popup-akun-delete-title">Anda yakin ingin menghapus akun?</p>
          <i className="fa fa-close" onClick={onClose}></i>
        </div>
        <div className="popup-akun-content">
          <span className="popup-akun-confirm">Masukkan nama pengguna untuk konfirmasi.</span>
          <Input
            placeholder="Masukkan nama pengguna"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="popup-footer">
          
          <button className="akun-delete-button" onClick={handleDelete}>Hapus Akun</button>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletePopup;
