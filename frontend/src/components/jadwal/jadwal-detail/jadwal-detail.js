import React, { useState, useEffect } from "react";
import { Input, message } from "antd";
import moment from "moment";
import "./jadwal-detail.css";
import {fetchDataIns, fetchDataRo} from "../../../server/api";

const EventDetailPopup = ({ selectedEvent, handleClosePopup }) => {

    const [Ins, setIns] = useState([]);
    const [instanceName, setInstanceName] = useState("");

    const [room, setRoom] = useState([]);
    const [roomName, setRoomName] = useState("");

    useEffect(() => {
        // Fetch room data on component mount
        const getIns = async () => {
            try {
                const data = await fetchDataIns();
                setIns(data);
            } catch (error) {
                console.error("Error fetching room data:", error);
            }
        };

        getIns();
    }, []);

    useEffect(() => {
        // Fetch room data on component mount
        const getRoom = async () => {
            try {
                const data = await fetchDataRo();
                setRoom(data);
            } catch (error) {
                console.error("Error fetching room data:", error);
            }
        };

        getRoom();
    }, []);

    useEffect(() => {
        // Find and set the instance name based on selectedEvent.instansi
        if (Ins.length > 0) {
            const matchedIns = Ins.find(Ins => Ins._id === selectedEvent.instansi);
            setInstanceName(matchedIns ? matchedIns.name : "Unknown");
        }
    }, [Ins, selectedEvent.instansi]);

    useEffect(() => {
        // Find and set the instance name based on selectedEvent.instansi
        if (room.length > 0) {
            const matchedRoom = room.find(room => room._id === selectedEvent.ruangan);
            setRoomName(matchedRoom ? matchedRoom.name : "Unknown");
        }
    }, [room, selectedEvent.ruangan]);

   

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
                            <td>Ruangan</td>
                            <td>:</td>
                            <td>{roomName}</td>
                        </tr>
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
            </div>
        </div>
    );
};

export default EventDetailPopup;
