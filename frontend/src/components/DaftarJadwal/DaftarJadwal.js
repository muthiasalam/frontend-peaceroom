import React, { useState, useEffect } from "react";
import "./DaftarJadwal.css";
import { fetchData, fetchDataRo } from "../../server/api";

const DaftarJadwal = () => {
  const [data, setData] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        console.log("Fetching data...");
        const jsonData = await fetchData();
        console.log("Data received:", jsonData);
  
        const today = new Date().toLocaleDateString('en-CA');
        console.log("Today's date:", today);
  
        const filteredData = jsonData.filter((item) => {
          
          const itemDate = new Date(item.date).toLocaleDateString('en-CA');
          console.log(`Item date: ${itemDate}, matches today: ${itemDate === today}`);
         
          return (itemDate === today && (item.status === "Disetujui" || item.status === "Rescheduled"));
        });
  
        console.log("Filtered data:", filteredData);
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDataAsync();
  }, []);
  
  

  useEffect(() => {
    const fetchRoomsAsync = async () => {
      try {
        console.log("Fetching rooms data...");
        const roomsData = await fetchDataRo();
        console.log("Rooms data received:", roomsData);
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching rooms data:", error);
      }
    };

    fetchRoomsAsync();
  }, []);

  const getRoomNameById = (roomId) => {
    const room = rooms.find((room) => room._id === roomId);
    return room ? room.name : "Unknown Room";
  };

  return (
    <div className="daftar-jadwal">
      <h1>Daftar Jadwal</h1>
      <table>
        <thead>
          <tr>
            <th className="jam-col">Jam</th>
            <th className="ruangan-col">Ruangan</th>
            <th className="jenis-pertemuan-col">Metode Pertemuan</th>
            <th className="peminjam-col">Peminjam</th>
            <th className="peminjam-col">Agenda</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5">No data available for today</td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item._id}>
                <td className="jam-col">{`${item.start_time} - ${item.end_time}`}</td>
                <td className="ruangan-col">{getRoomNameById(item.room)}</td>
                <td className="jenis-pertemuan-col">
                  {item.conference_type === "Offline" ? "Offline" : "Online"}
                </td>
                <td className="peminjam-col">{item.name}</td>
                <td className="peminjam-col">{item.activity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarJadwal;