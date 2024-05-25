import React, { useState, useEffect } from "react";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import PanoramaWideAngleSelectIcon from "@mui/icons-material/PanoramaWideAngleSelect";
import CastIcon from "@mui/icons-material/Cast";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import "./ruangan.css";
import { fetchDataRo, updateRoom, deleteRoom } from "../../server/api"; // Adjust the import path accordingly

// Komponen popup untuk konfirmasi penghapusan
const DeleteConfirmationPopup = ({ onCancel, onDelete }) => {
  return (
    <div className="delete-popup-container">
      <div className="delete-popup">
        <h4>Anda yakin untuk menghapus ruang ini?</h4>
        <div className="button-delete12">
          <button className="for-delete" onClick={onDelete}>Hapus</button>
          <button className="for-cancel" onClick={onCancel}>Batalkan</button>
        </div>
      </div>
    </div>
  );
};

// Komponen popup untuk mengedit ruangan
const EditPopup = ({ roomData, onClose, onSave }) => {
  
  const [editedRoom, setEditedRoom] = useState(roomData);

  const handleNameChange = (e) => {
    const { value } = e.target;
    setEditedRoom(prevState => ({
      ...prevState,
      roomName: value
    }));
  };

  const handleDetailChange = (e, index, column) => {
    const { value } = e.target;
    setEditedRoom(prevState => {
      const updatedDetails = { ...prevState.details };
      updatedDetails[column][index].count = parseInt(value, 10);
      return {
        ...prevState,
        details: updatedDetails
      };
    });
  };

  const handleSave = () => {
    onSave(editedRoom);
    onClose();
  };

  const getFileNameFromURL = (url) => {
    return url.split('/').pop();
  };

  return (
    <div className="popup-container1">
      <div className="popup1">
        <h3>Mengedit Informasi Ruangan</h3>
        <form>
          <div className="form-nama-ruangan">
            <label>Nama</label>
            <input type="text" name="roomName" value={editedRoom.roomName} onChange={handleNameChange} />
          </div>
          <div className="details-container">
            <div className="detail-column">
              {editedRoom.details.leftDetails.map((detail, index) => (
                <div key={index} className="detail-item">
                  <label>{detail.title}</label>
                  <input type="number" name={detail.title} value={detail.count} onChange={(e) => handleDetailChange(e, index, 'leftDetails')} />
                </div>
              ))}
            </div>
            <div className="detail-column">
              {editedRoom.details.rightDetails.map((detail, index) => (
                <div key={index} className="detail-item">
                  <label>{detail.title}</label>
                  <input type="number" name={detail.title} value={detail.count} onChange={(e) => handleDetailChange(e, index, 'rightDetails')} />
                </div>
              ))}
            </div>
          </div>
          <div className="gambar-ruangan">
            <label htmlFor="gambar">Gambar</label>
            <div className="upload-gambar">
              <input type="text" id="gambar" name="gambar" value={getFileNameFromURL(editedRoom.imageSource)} readOnly />
              <button>
                Upload <UploadIcon className="upload-icon" />
              </button>
            </div>
          </div>
          <button className="button-container" type="button" onClick={handleSave}>Simpan</button>
        </form>
      </div>
    </div>
  );
};


const RoomDetail = ({ roomName, leftButton1Title, leftButton2Title, leftDetails, rightDetails, imageSource, roomId, updateRooms }) => {
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [currentRoomData, setCurrentRoomData] = useState({ roomName: '', details: { leftDetails: [], rightDetails: [] }, imageSource: '' });

  const handleEditButtonClick = () => {
    setCurrentRoomData({
      roomName,
      details: { leftDetails, rightDetails },
      imageSource,
      roomId
    });
    setIsEditPopupOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Panggil fungsi untuk menghapus ruangan dari server
      const response = await deleteRoom(roomId); // Anda perlu mengimplementasikan fungsi deleteRoom sesuai dengan server Anda
      if (response.success) {
        console.log("Ruangan berhasil dihapus.");
        // Panggil fungsi untuk memperbarui daftar ruangan dengan data terbaru dari server
        updateRooms(response.updatedRooms);
      } else {
        console.error("Gagal menghapus ruangan.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDeleteConfirmationOpen(false); // Tutup popup konfirmasi penghapusan setelah selesai
    }
  };

  const handleCloseEditPopup = () => {
    setIsEditPopupOpen(false);
  };

  const handleCloseDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(false);
  };

  const handleSaveEditedRoom = async (editedRoom) => {
    try {
      const response = await updateRoom(editedRoom.roomId, {
        name: editedRoom.roomName,
        table: editedRoom.details.leftDetails.find(detail => detail.title === "Meja").count,
        air_conditioner: editedRoom.details.leftDetails.find(detail => detail.title === "AC").count,
        chair: editedRoom.details.leftDetails.find(detail => detail.title === "Kursi").count,
        screen: editedRoom.details.rightDetails.find(detail => detail.title === "Layar").count,
        projector: editedRoom.details.rightDetails.find(detail => detail.title === "Proyektor").count,
        audio: editedRoom.details.rightDetails.find(detail => detail.title === "Audio").count,
        image: editedRoom.imageSource.split('/').pop() // assuming the image is unchanged
      });
      if (response) {
        console.log("Perubahan disimpan di server.");
        updateRooms(response); // Pass the updated room data from server response
      } else {
        console.error("Gagal menyimpan perubahan di server.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="room">
      <img src={imageSource} alt={roomName} />
      <div className="jenis-ruangan">
        <p>{roomName}</p>
        <div className="container">
          <table className="detail-left">
            <tbody>
              {leftDetails.map((detail, index) => (
                <tr key={index}>
                  <th>{detail.icon}</th>
                  <td>{detail.title}: {detail.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="detail-right">
            <tbody>
              {rightDetails.map((detail, index) => (
                <tr key={index}>
                  <th>{detail.icon}</th>
                  <td>{detail.title}: {detail.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="left-buttons">
            <div className="button-containerr">
              <button className="icon-edit" onClick={handleEditButtonClick}>
                {leftButton1Title} <EditIcon/>
              </button>
            </div>
            <div className="button-containerr">
              <button className="icon-delete" onClick={handleDeleteClick}>
                {leftButton2Title} <DeleteIcon/>
              </button>
            </div>
          </div>
        </div>
      </div>
      {isEditPopupOpen && <EditPopup roomData={currentRoomData} onClose={handleCloseEditPopup} onSave={handleSaveEditedRoom} />}
      {isDeleteConfirmationOpen && <DeleteConfirmationPopup onCancel={handleCloseDeleteConfirmation} onDelete={handleConfirmDelete} />}
    </div>
  );
};


const Ruangan = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRooms = async () => {
      try {
        const data = await fetchDataRo();
        setRooms(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getRooms();
  }, []);

  const updateRooms = (updatedRoom) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room._id === updatedRoom._id ? updatedRoom : room
      )
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="room-container">
      <div className="rooms-wrapper">
        {rooms.map((room) => (
          <RoomDetail
            key={room._id}
            roomId={room._id}
            roomName={room.name}
            imageSource={`http://localhost:3001/uploads/images/${room.image}`} // Adjust the base URL accordingly
            leftDetails={[
              { icon: <PanoramaWideAngleSelectIcon />, title: "Meja", count: room.table },
              { icon: <AcUnitIcon />, title: "AC", count: room.air_conditioner },
              { icon: <AirlineSeatReclineNormalIcon />, title: "Kursi", count: room.chair }
            ]}
            rightDetails={[
              { icon: <CastIcon />, title: "Layar", count: room.screen },
              { icon: <TimelapseIcon />, title: "Proyektor", count: room.projector },
              { icon: <VolumeUpIcon />, title: "Audio", count: room.audio }
            ]}
            leftButton1Title="Edit"
            leftButton2Title="Delete"
            updateRooms={updateRooms} // Pass the updateRooms function to RoomDetail
          />
        ))}
      </div>
    </div>
  );
};

export default Ruangan;
