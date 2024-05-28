import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import './dashboard.css';
import Navbar from "../../components/sidebar/sidebar";
import { fetchData, fetchDataRo, fetchDataIns } from '../../server/api';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import moment from 'moment';

// Register the required components for ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState([]);
  const [allBookingData, setAllBookingData] = useState([]);
  const [instances, setInstances] = useState([]);
  
  const navigate = useNavigate();
  const { isLoggedIn, username } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isLoggedIn || !token) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const getRooms = async () => {
      try {
        const data = await fetchDataRo();
        const roomOptions = data.map(room => ({
          value: room._id,
          label: room.name,
        }));
        setRooms(roomOptions);

        // Set default room to "Ruang Rapat" if available
        const defaultRoom = roomOptions.find(room => room.label === "Ruang Rapat");
        if (defaultRoom) {
          setSelectedRoom(defaultRoom.value);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        message.error('Error fetching rooms');
      }
    };

    getRooms();
  }, []);

  useEffect(() => {
    const getBookings = async () => {
      try {
        const data = await fetchData();
        setAllBookingData(data);

        if (selectedRoom) {
          const filteredData = data.filter(booking => 
            booking.room === selectedRoom && 
            booking.status === "Disetujui" &&
            moment(booking.date).isBetween(moment().subtract(6, 'days').startOf('day'), moment().endOf('day'))
          );
          setBookingData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        message.error('Error fetching bookings');
      }
    };

    getBookings();
  }, [selectedRoom]);

  useEffect(() => {
    const getInstances = async () => {
      try {
        const data = await fetchDataIns();
        setInstances(data);
      } catch (error) {
        console.error('Error fetching instances:', error);
        message.error('Error fetching instances');
      }
    };

    getInstances();
  }, []);

  const handleRoomChange = (value) => {
    setSelectedRoom(value);
  };

  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => moment().subtract(i, 'days').format('YYYY-MM-DD')).reverse();
    const dataCounts = last7Days.map(day => bookingData.filter(booking => moment(booking.date).format('YYYY-MM-DD') === day).length);

    return {
      labels: last7Days,
      datasets: [{
        label: 'Frekuensi Penggunaan Ruangan',
        data: dataCounts,
        borderColor: '#A4C0F5',
        backgroundColor: '#A4C0F5',
      }],
    };
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  const generateInstanceChartData = () => {
    const instanceCounts = allBookingData.reduce((acc, booking) => {
      if (booking.status === "Disetujui" && moment(booking.date).isBefore(moment())) {
        acc[booking.instance] = (acc[booking.instance] || 0) + 1;
      }
      return acc;
    }, {});

    const sortedInstances = Object.entries(instanceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const instanceNames = sortedInstances.map(([instanceId]) => instances.find(instance => instance._id === instanceId)?.name || 'Unknown');
    const visitCounts = sortedInstances.map(([, count]) => count);

    return {
      labels: instanceNames,
      datasets: [{
        label: 'Jumlah Kunjungan',
        data: visitCounts,
        backgroundColor: '#A4C0F5',
        borderColor: '#A4C0F5',
      }]
    };
  };

  const instanceChartOptions = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="dashboard-page-container">
      <Navbar
        className="navbar"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className="dashboard-page"
        style={{ marginLeft: isSidebarOpen ? "200px" : "60px" }}
      >
        <div className="dashboard-header">
          <div className="dashboard-header-element">
            <span className="user">{username}</span>
            <span className="status-ruangan-link" onClick={() => navigate('/status')}>Status Ruangan</span>
          </div>
        </div>
        <div className="title-container">
          <div className="title">Dashboard</div>
        </div>
        <div className="dashboard-content-container">
          <div className="dashboard-content">
            <div className="dashboard-content-top">
              <div className="dashboard-content-title">Statistik Penggunaan Ruangan Minggu Ini</div>
              <Select
                style={{ width: '15%' }}
                placeholder="Pilih Ruangan"
                options={rooms}
                value={selectedRoom}
                onChange={handleRoomChange}
              />
            </div>
            <div className="dashboard-content-chart">
              <div className="chart-frekuensi">
                <Line data={generateChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-content-top">
              <div className="dashboard-content-title">5 Instansi Paling Sering Berkunjung</div>
            </div>
            <div className="dashboard-content-chart">
            <div className="chart-frekuensi">
              <Bar data={generateInstanceChartData()} options={instanceChartOptions} />
            </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
