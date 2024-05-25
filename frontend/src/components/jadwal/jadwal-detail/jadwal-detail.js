import React, { useState, useEffect } from "react";
import { Input, message } from "antd";
import moment from "moment";
import "./jadwal-detail.css";
import { deleteData, fetchDataIns } from "../../../server/api";

const EventDetailPopup = ({ selectedEvent, handleClosePopup }) => {
    const [bookingId, setBookingId] = useState("");
    const [rooms, setRooms] = useState([]);
    const [instanceName, setInstanceName] = useState("");

    useEffect(() => {
        // Fetch room data on component mount
        const getRooms = async () => {
            try {
                const data = await fetchDataIns();
                setRooms(data);
            } catch (error) {
                console.error("Error fetching room data:", error);
            }
        };

        getRooms();
    }, []);

    useEffect(() => {
        // Find and set the instance name based on selectedEvent.instansi
        if (rooms.length > 0) {
            const matchedRoom = rooms.find(room => room._id === selectedEvent.instansi);
            setInstanceName(matchedRoom ? matchedRoom.name : "Unknown");
        }
    }, [rooms, selectedEvent.instansi]);

    const handleDelete = async () => {
        const trimmedBookingId = bookingId.trim();

        console.log("Input Booking ID:", trimmedBookingId);
        console.log("Selected Event ID:", selectedEvent.id);

        if (!trimmedBookingId) {
            message.error("Booking ID harus diisi");
            return;
        }

        if (trimmedBookingId !== selectedEvent.id) {
            message.error("Booking ID tidak cocok");
            return;
        }

        try {
            await deleteData(selectedEvent.idItem);
            message.success("Jadwal berhasil dibatalkan");
            handleClosePopup();
        } catch (error) {
            console.log("Selected Event ID Item:", selectedEvent.idItem);
            message.error("Gagal membatalkan jadwal");
            console.error("Error deleting data:", error);
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <div className="jadwal-detail-top">
                    <h3>{selectedEvent.title}</h3>
                    <i className="fa fa-close" onClick={handleClosePopup}></i>
                </div>

                <table className="detail-event-table">
                    <tbody>
                        <tr>
                            <td>Instansi</td>
                            <td>:</td>
                            <td>{instanceName}</td>
                        </tr>
                        <tr>
                            <td>Jam</td>
                            <td>:</td>
                            <td>{moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}</td>
                        </tr>
                        <tr>
                            <td>Status</td>
                            <td>:</td>
                            <td>{selectedEvent.status}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="jadwal-detail-bottom">
                    <p>Ingin membatalkan jadwal?</p>
                    <Input
                        className="input-batal-jadwal-detail"
                        placeholder="Masukkan booking ID Anda"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                    />
                </div>
                <button className="detail-event-button" onClick={handleDelete}>Batalkan Jadwal</button>
            </div>
        </div>
    );
};

export default EventDetailPopup;
