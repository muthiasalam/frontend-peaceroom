import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';


import "./jadwal-form-success.css";

export const Popup = ({ onClose, newBookingId }) => {
  const [copied, setCopied] = useState(false);


  const copyToClipboard = () => {
    navigator.clipboard.writeText(newBookingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset the icon after 2 seconds
    });
  };

  return (
    <div className="form-success-container">
      <div className="form-success-text">
        <span className="text1-wrapper">
          Pengajuan Peminjaman Ruang Rapat Anda Dikirimkan
        </span>
        <p className="text2-wrapper">
          Pantau jadwal penggunaan ruangan untuk mengecek status peminjaman
        </p>
      </div>
      <button className="form-success-button" onClick={onClose}>cek jadwal</button>
    </div>
  );
};
