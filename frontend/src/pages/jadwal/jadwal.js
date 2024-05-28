import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/header/header";
import CalendarComponent from "../../components/jadwal/jadwal-calendar/jadwal-calendar";
import FormPengajuan from "../../components/jadwal/jadwal-form/jadwal-form";
import { Input, message, Select } from "antd"; // Import Select dari Ant Design
import "./jadwal.css";
import { createData, fetchData, fetchDataRo } from "../../server/api";
import { Popup } from "../../components/jadwal/jadwal-form-success/jadwal-form-success";
import EventDetailPopup from "../../components/jadwal/jadwal-detail/jadwal-detail";
import moment from 'moment';

const { Option } = Select;

export default function Jadwal() {
  const [data, setData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeRuangan, setActiveRuangan] = useState(null);
  const [ruanganList, setRuanganList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [newBookingId, setNewBookingId] = useState(null);

  const calendarRef = useRef(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const rooms = await fetchDataRo();
        setRuanganList(rooms);

        const defaultRoom = rooms.find(room => room.name === "Ruang CCTV");
        if (defaultRoom) {
          setActiveRuangan(defaultRoom._id);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleRuanganChange = (ruanganId) => {
    setActiveRuangan(ruanganId);
    const selectedRoom = ruanganList.find(room => room._id === ruanganId);
    if (selectedRoom) {
      console.log(`Selected Room ID: ${selectedRoom._id}`);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleClosePopup = () => {
    setSelectedEvent(null);
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

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false);
  };

  return (
    <>
      <Header />
      <div className="jadwal-main">
        <div className="jadwal-top">
          <div className="jadwal-top-left">
            <h2>Jadwal Penggunaan Peace Room</h2>
          </div>
          <div className="jadwal-top-right">
            <div className="jadwal-top-ruangan">
              <Select
                style={{ width: 150 }}
                value={activeRuangan}
                onChange={handleRuanganChange}
              >
                {ruanganList.map(room => (
                  <Option key={room._id} value={room._id}>
                    {room.name}
                  </Option>
                ))}
              </Select>
            </div>
            <button className="button-jadwal" onClick={openPopup}>Tambah Jadwal</button>
          </div>
        </div>

        <div className="jadwal-middle">
          <CalendarComponent ref={calendarRef} activeRuangan={activeRuangan} onSelectEvent={handleSelectEvent} />
        </div>
        <div className="jadwal-bottom">
          <span className="keterangan setuju">Disetujui</span>
          <span className="keterangan proses">Diproses</span>
          <span className="keterangan batal">Dibatalkan</span>
        </div>

        {isPopupOpen && (
          <div className="popup-container">
            <div className="popup">
              <FormPengajuan onSubmit={handleCreateData} onClose={closePopup} />
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

        {selectedEvent && (
          <EventDetailPopup selectedEvent={selectedEvent} handleClosePopup={handleClosePopup} />
        )}
      </div>
    </>
  );
}
