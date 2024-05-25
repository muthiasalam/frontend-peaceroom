import React, { useState, useEffect } from "react";
import './peminjaman-detail.css';
import { PencilLine } from "lucide-react";
import { fetchDataIns, fetchDataRo } from "../../../server/api";
import FormEditPengajuan from '../../jadwal/jadwal-edit-form/jadwal-edit-form'; // Import form edit

const DetailPeminjaman = ({ peminjaman, onClose, onUpdate }) => {
  const [instances, setInstances] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [instanceName, setInstanceName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State untuk mengelola tampilan form edit

  useEffect(() => {
    const getInstances = async () => {
      try {
        const fetchedInstances = await fetchDataIns();
        setInstances(fetchedInstances);
        const instance = fetchedInstances.find(inst => inst._id === peminjaman.instance);
        if (instance) setInstanceName(instance.name);
      } catch (error) {
        console.error("Error fetching instances:", error);
      }
    };

    const getRooms = async () => {
      try {
        const fetchedRooms = await fetchDataRo();
        setRooms(fetchedRooms);
        const room = fetchedRooms.find(rm => rm._id === peminjaman.room);
        if (room) setRoomName(room.name);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    getInstances();
    getRooms();
  }, [peminjaman.instance, peminjaman.room]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = (updatedData) => {
    setIsEditing(false);
    onUpdate(updatedData);  // Perbarui data di state peminjaman.js
    onClose(); // Tutup form detail setelah berhasil memperbarui
  };

  // Function to format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="detail-peminjaman-container">
      {isEditing ? (
         <FormEditPengajuan
         initialData={peminjaman}
         onSubmit={onClose}  // Optionally handle additional logic on submit
         onClose={onClose}
         onUpdate={onUpdate}  // Pass down the onUpdate prop
       />
      ) : (
        <>
          <div className="detail-title-close">
            <h3>Detail Peminjaman</h3>
            <i className="fa fa-close" onClick={onClose}></i>
          </div>
          <table className="detail-table">
            <tbody>
              <tr>
                <td>Jenis Surat</td>
                <td>:</td>
                <td>{peminjaman.conference_type}</td>
              </tr>
              <tr>
                <td>Nama</td>
                <td>:</td>
                <td>{peminjaman.name}</td>
              </tr>
              <tr>
                <td>Instansi</td>
                <td>:</td>
                <td>{instanceName}</td>
              </tr>
              <tr>
                <td>Agenda</td>
                <td>:</td>
                <td>{peminjaman.activity}</td>
              </tr>
              <tr>
                <td>Ruangan</td>
                <td>:</td>
                <td>{roomName}</td>
              </tr>
              <tr>
                <td>Tanggal</td>
                <td>:</td>
                <td>{formatDate(peminjaman.date)}</td>
              </tr>
              <tr>
                <td>Jam</td>
                <td>:</td>
                <td>{peminjaman.start_time} - {peminjaman.end_time}</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>:</td>
                <td>{peminjaman.status}</td>
              </tr>
              <tr>
  <td>Lampiran</td>
  <td>:</td>
  <td>
    {peminjaman.letter ? (
      <a href={`http://localhost:3001/uploads/letters/${peminjaman.letter}`} target="_blank">
        {peminjaman.letter}
      </a>
    ) : peminjaman.copyLetter ? (
      <a href={`http://localhost:3001/uploads/letters/${peminjaman.copyLetter}`} target="_blank">
        {peminjaman.copyLetter}
      </a>
    ) : (
      "Tidak ada lampiran"
    )}
  </td>
</tr>
            </tbody>
          </table>
          <button className="peminjaman-detail-edit" onClick={handleEditClick}>
            <span className="peminjaman-detail-edit-text">Edit</span>
            <PencilLine className="peminjaman-detail-edit-icon" />
          </button>
        </>
      )}
    </div>
  );
};

export default DetailPeminjaman;
