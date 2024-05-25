import React from "react";
import "./peminjaman-popup-delete.css";

const PopupDelete = ({ onCancel, onDelete }) => {
  return (
    <div className="popup-delete-container">
      <span className="delete-text-wrapper">Apakah Anda yakin ingin menghapus data ini?</span>
      <div className="delete-button-wrapper">
        <button className="popup-delete-button1" onClick={onCancel}>
          Batalkan
        </button>
        <button className="popup-delete-button2" onClick={onDelete}>
          Hapus
        </button>
      </div>
    </div>
  );
};

export default PopupDelete;
