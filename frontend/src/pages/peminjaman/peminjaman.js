import React, { useState, useEffect } from "react";
import Header from "../../components/navbar/navbar";
import "./peminjaman.css";
import Table from "../../components/peminjaman/peminjaman-tabel/peminjaman-tabel-content/peminjaman-tabel-content";
import Navbar from "../../components/sidebar/sidebar";
import FormPengajuan from "../../components/jadwal/jadwal-form/jadwal-form";
import DetailPeminjaman from "../../components/peminjaman/peminjaman-detail/peminjaman-detail";
import { fetchData, updateStatus, deleteData, createData } from "../../server/api";
import { Popup } from "../../components/jadwal/jadwal-form-success/jadwal-form-success";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";

export default function Peminjaman() {
  const [data, setData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPeminjamanDetail, setSelectedPeminjamanDetail] = useState(null);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [newBookingId, setNewBookingId] = useState(null);

  const navigate = useNavigate();
  const { isLoggedIn, username } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isLoggedIn || !token) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchData()
      .then((jsonData) => setData(jsonData))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleUpdateStatus = async (id, newStatus, letter = null) => {
    try {
      await updateStatus(id, newStatus, letter);
      fetchData()
        .then((jsonData) => setData(jsonData))
        .catch((error) => console.error("Error fetching updated data:", error));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteData = async (id) => {
    try {
      await deleteData(id);
      fetchData()
        .then((jsonData) => setData(jsonData))
        .catch((error) => console.error("Error fetching updated data:", error));
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const handleCreateData = async () => {
    try {
      const newData = await fetchData();
      setData(newData);
      const newBookingId = newData[newData.length - 1].id;
      setNewBookingId(newBookingId);
      setIsSuccessPopupOpen(true);
    } catch (error) {
      console.error("Error creating data:", error);
    }
  };

  const handleUpdateData = async (updatedItem) => {
    try {
      await fetchData();
      const newData = await fetchData();
      setData(newData);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const openDetailPopup = (peminjaman) => {
    setSelectedPeminjamanDetail(peminjaman);
    setIsDetailOpen(true);
  };

  const closeDetailPopup = () => {
    setSelectedPeminjamanDetail(null);
    setIsDetailOpen(false);
  };

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false);
  };

  
  const handleStatusLinkClick = () => {
    navigate('/status');
  };
  return (
    <div className="peminjaman-page-container">
      <Navbar
        className="navbar"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className="peminjaman-page"
        style={{ marginLeft: isSidebarOpen ? "200px" : "60px" }}

      >
        <div className="userClass">
        <div className="userClass1">
          <span className="user">{username}</span>
          <span className="status-ruangan-link" onClick={handleStatusLinkClick}>Status Ruangan</span></div>
        </div>
        <div className="title-button">
          <div className="title">Daftar Peminjaman Peace Room</div>
          <button className="button-jadwal" onClick={openPopup}>
            Tambah Jadwal
          </button>
        </div>
        <div className="table-container-page">
          <Table
            data={data}
            rowsPerPage={10}
            updateDataStatus={handleUpdateStatus}
            deleteData={handleDeleteData}
            onSelect={(peminjaman) => openDetailPopup(peminjaman)}
          />
        </div>
      </main>

      {isPopupOpen && (
        <div className="popup-container">
          <div className="popup">
            <FormPengajuan onSubmit={handleCreateData} onClose={closePopup} />
          </div>
        </div>
      )}

      {isDetailOpen && selectedPeminjamanDetail && (
        <div className="popup-container">
          <div className="popup">
            <DetailPeminjaman
              peminjaman={selectedPeminjamanDetail}
              onClose={closeDetailPopup}
              onUpdate={handleUpdateData}
            />
          </div>
        </div>
      )}

      {isSuccessPopupOpen && (
        <div className="popup-container">
          <div className="popup">
            <Popup onClose={closeSuccessPopup} newBookingId={newBookingId} />
          </div>
        </div>
      )}
    </div>
  );
}
