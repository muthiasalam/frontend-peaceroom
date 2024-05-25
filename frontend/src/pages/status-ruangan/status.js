import React, { useState, useEffect } from "react";
import Header from "../../components/header/header";
import Background from "../../assets/newbackground.jpeg";
import "./status.css";
import { fetchData, fetchDataRo, fetchDataIns } from "../../server/api"; // Sesuaikan path import sesuai struktur proyek Anda

export default function Status() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    const fetchDataAndRoomsAndInstances = async () => {
      try {
        const [meetingsData, roomsData, instancesData] = await Promise.all([fetchData(), fetchDataRo(), fetchDataIns()]);
        setMeetings(meetingsData);
        setRooms(roomsData);
        setInstances(instancesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndRoomsAndInstances();
  }, []);

  const currentDate = new Date();
  const currentTime = currentDate.getTime();

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayName = days[currentDate.getDay()];
  const day = currentDate.getDate();
  const monthName = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  const formattedDate = `${dayName}, ${day} ${monthName} ${year}`;

  // Function to combine date and time strings into a Date object
  const combineDateTime = (dateString, timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date(dateString);
    date.setHours(hours, minutes);
    return date;
  };

  // Function to get room name by _id
  const getRoomNameById = (roomId) => {
    const room = rooms.find((room) => room._id === roomId);
    return room ? room.name : "Unknown Room";
  };

  // Function to get instance name by _id
  const getInstanceNameById = (instanceId) => {
    const instance = instances.find((instance) => instance._id === instanceId);
    return instance ? instance.name : "Unknown Instance";
  };

  // Filter for meetings that are currently ongoing and approved
  const ongoingMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    const meetingStart = combineDateTime(meetingDate, meeting.start_time).getTime();
    const meetingEnd = combineDateTime(meetingDate, meeting.end_time).getTime();
    return currentTime >= meetingStart && currentTime <= meetingEnd && meeting.status === "Disetujui";
  });

  // Filter for meetings that are upcoming today and approved
  const upcomingMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    const meetingStart = combineDateTime(meetingDate, meeting.start_time).getTime();
    return meetingDate.toDateString() === currentDate.toDateString() && meetingStart > currentTime && meeting.status === "Disetujui";
  });

  return (
    <>
      <Header />
      <div className="status-component">
        <div className="image-container">
          <div className="date-overlay">{formattedDate}</div>
          <img src={Background} alt="" />
          <div className="live-components-container">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : ongoingMeetings.length > 0 ? (
              ongoingMeetings.map((meeting) => (
                <div key={meeting._id} className="live-component">
                  <div className="live-status">
                    <div className="room-name">{getRoomNameById(meeting.room)}</div>
                    <div className="not-available">
                      <h1>{meeting.name}</h1>
                      <p>{getInstanceNameById(meeting.instance)}</p>
                      <div className="waktu-pelaksanaan">
                        <p>{`${meeting.start_time} - ${meeting.end_time}`}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No ongoing meetings</p>
            )}
          </div>
          <div className="next-teks">
            <p>Selanjutnya</p>
          </div>
          <div className="next-program-component">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((nextMeeting) => (
                <div key={nextMeeting._id} className="next-program">
                  <p>{`${nextMeeting.start_time} - ${nextMeeting.end_time}`}</p>
                  <h1>{nextMeeting.name}</h1>
                  <p>{getInstanceNameById(nextMeeting.instance)}</p>
                </div>
              ))
            ) : (
              <p>No upcoming meetings today</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
