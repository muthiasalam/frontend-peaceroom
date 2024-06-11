import React, { useState, useEffect } from "react";
import Navbar from "../../components/sidebar/sidebar";
import "./styleRuangan.css";
import MenuRuangan from "../../components/ruangan-admin/ruangan";
import UploadIcon from "@mui/icons-material/Upload";
import { fetchDataRo, createDataRo } from "../../server/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";

const Ruangan = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const navigate = useNavigate();
  const { username } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [newRoomData, setNewRoomData] = useState({
    name: "",
    table: 0,
    screen: 0,
    air_conditioner: 0,
    projector: 0,
    chair: 0,
    audio: 0,
    image: "",
  });
  const [imageFileName, setImageFileName] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await fetchDataRo();
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  const openAddRoomModal = () => {
    setIsAddRoomModalOpen(true);
  };

  const closeAddRoomModal = () => {
    setIsAddRoomModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoomData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFileName(file.name);
      setNewRoomData((prevData) => ({
        ...prevData,
        image: file,
      }));
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newRoomData.name);
    formData.append("table", newRoomData.table);
    formData.append("screen", newRoomData.screen);
    formData.append("air_conditioner", newRoomData.air_conditioner);
    formData.append("projector", newRoomData.projector);
    formData.append("chair", newRoomData.chair);
    formData.append("audio", newRoomData.audio);
    if (newRoomData.image) {
      formData.append("image", newRoomData.image);
    }

    try {
      const createdRoom = await createDataRo(formData);
      if (createdRoom) {
        setRooms([...rooms, createdRoom]);
        setNewRoomData({
          name: "",
          table: 0,
          screen: 0,
          air_conditioner: 0,
          projector: 0,
          chair: 0,
          audio: 0,
          image: "",
        });
        setImageFileName("");
        closeAddRoomModal();
      } else {
        throw new Error("Failed to create room");
      }
    } catch (error) {
      console.error("Error adding room:", error.message);
    }
  };

  const handleUploadButtonClick = () => {
    document.getElementById("imageUpload").click();
  };

  return (
    <div>
      <div className="ruangan-page-container">
        <Navbar
          className="navbar"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main
          className="ruangan-page"
          style={{ marginLeft: isSidebarOpen ? "200px" : "60px" }}
        >
          <div className="admin-name">
          <span className="user">{username}</span>
            <span
              className="status-ruangan-link"
              onClick={() => navigate("/status")}
            >
              Status Ruangan
            </span>
          </div>
          <div className="title-ruangan">
            <div className="title">Galeri Ruangan Peace Room</div>
            <button className="button-ruangan" onClick={openAddRoomModal}>
              Tambah Ruangan
            </button>
          </div>
        </main>
      </div>
      <div className="ruangan-content-container">
        <main
          className="ruangan-page-position"
          style={{ marginLeft: isSidebarOpen ? "200px" : "60px" }}
        >
          <MenuRuangan rooms={rooms} />
        </main>
      </div>
      {isAddRoomModalOpen && (
        <div className="add-room-modal-overlay">
          <div className="add-room-modal">
            <h3 className="h3">Menambah Ruangan</h3>
            <form onSubmit={handleAddRoom}>
              <div className="nama-ruangan">
                <label htmlFor="name">Nama</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newRoomData.name}
                  onChange={handleInputChange}
                  placeholder="Nama Ruangan"
                />
              </div>
              <div className="meja-layar">
                <div className="input-group">
                  <label htmlFor="table">Meja</label>
                  <input
                    type="number"
                    id="table"
                    name="table"
                    value={newRoomData.table}
                    onChange={handleInputChange}
                    placeholder="Jumlah Meja"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="screen">Layar</label>
                  <input
                    type="number"
                    id="screen"
                    name="screen"
                    value={newRoomData.screen}
                    onChange={handleInputChange}
                    placeholder="Jumlah Layar"
                  />
                </div>
              </div>
              <div className="ac-proyektor">
                <div className="input-group">
                  <label htmlFor="air_conditioner">AC</label>
                  <input
                    type="number"
                    id="air_conditioner"
                    name="air_conditioner"
                    value={newRoomData.air_conditioner}
                    onChange={handleInputChange}
                    placeholder="Jumlah AC"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="projector">Proyektor</label>
                  <input
                    type="number"
                    id="projector"
                    name="projector"
                    value={newRoomData.projector}
                    onChange={handleInputChange}
                    placeholder="Jumlah Proyektor"
                  />
                </div>
              </div>
              <div className="kursi-audio">
                <div className="input-group">
                  <label htmlFor="chair">Kursi</label>
                  <input
                    type="number"
                    id="chair"
                    name="chair"
                    value={newRoomData.chair}
                    onChange={handleInputChange}
                    placeholder="Jumlah Kursi"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="audio">Audio</label>
                  <input
                    type="number"
                    id="audio"
                    name="audio"
                    value={newRoomData.audio}
                    onChange={handleInputChange}
                    placeholder="Jumlah Audio"
                  />
                </div>
              </div>
              <div className="gambar-ruangan">
                <label htmlFor="image">Gambar</label>
                <div className="upload-gambar">
                  <input
                    type="file"
                    id="imageUpload"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={imageFileName || newRoomData.image}
                    readOnly
                    placeholder="Silahkan upload gambar"
                  />
                  <button type="button" onClick={handleUploadButtonClick}>
                    <span className="button-content">
                      Upload <UploadIcon className="upload-icon" />
                    </span>
                  </button>
                </div>
              </div>
              <button className="button-tambahruangan" type="submit">
                Selesai
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ruangan;