import React, { useState, useEffect } from "react";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import PanoramaWideAngleSelectIcon from "@mui/icons-material/PanoramaWideAngleSelect";
import CastIcon from "@mui/icons-material/Cast";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { fetchDataRo } from "../../server/api";
import "./ruangan-user.css";

const RoomDetail = ({ roomName, imageSource, leftDetails, rightDetails }) => {
  return (
    <div className="room-beranda">
      <img src={imageSource} alt={roomName}></img>
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
        </div>
      </div>
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="rooms-container">
      <div className="rooms-wrap">
        {rooms.map((room) => (
          <RoomDetail
            key={room._id}
            roomName={room.name}
            imageSource={`http://localhost:3001/uploads/images/${room.image}`} // Sesuaikan URL dasar
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
          />
        ))}
      </div>
    </div>
  );
};

export default Ruangan;