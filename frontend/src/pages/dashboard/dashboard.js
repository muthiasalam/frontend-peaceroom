import React, { useState, useEffect, useRef } from "react";
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
import { Line, Bar, Pie } from "react-chartjs-2";
import moment from "moment";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { Chart, ArcElement } from "chart.js";
Chart.register(ArcElement);

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
  const [totals, setTotals] = useState({
    disetujui: 0,
    dibatalkan: 0,
    diproses: 0,
    total: 0,
  });
  const [pieChartData, setPieChartData] = useState({
    labels: ["Disetujui", "dibatalkan"],
    datasets: [
      {
        label: "Persentase Status Peminjaman",
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        data: [0, 0],
      },
    ],
  });

  const pieChartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          alignText: "center",
          padding: 20,
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  const roomUsagePieChartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          alignText: "center",
          align: "center",
          padding: 20,
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  const [roomUsageData, setRoomUsageData] = useState([]);

  useEffect(() => {
    const fetchRoomUsageData = async () => {
      try {
        const rooms = await fetchDataRo();
        const bookings = await fetchData();
        const totalBookings = bookings.length;

        const roomUsage = rooms.map((room) => {
          const bookingsForRoom = bookings.filter(
            (booking) => booking.room === room._id
          );
          const bookingCount = bookingsForRoom.length;
          const percentage = (bookingCount / totalBookings) * 100;
          return {
            name: room.name,
            percentage: percentage.toFixed(2),
          };
        });

        setRoomUsageData(roomUsage);
      } catch (error) {
        console.error("Error fetching room usage data:", error);
        message.error("Error fetching room usage data");
      }
    };

    fetchRoomUsageData();
  }, []);

  const roomUsagePieChartData = {
    labels: roomUsageData.map((room) => room.name),
    datasets: [
      {
        label: "Persentase Penggunaan Ruangan",
        backgroundColor: ["rgba(255, 234, 46, 0.33)", "rgba(164, 245, 201, 1)"],
        data: roomUsageData.map((room) => room.percentage),
      },
    ],
  };

  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate("/peminjaman");
  };
  const { isLoggedIn, username } = useAuth();
  const pieChartRef = useRef(null);
  
  
  

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

        const statusCounts = data.reduce(
          (acc, booking) => {
            if (booking.status === "Disetujui") acc.disetujui += 1;
            if (booking.status === "dibatalkan") acc.dibatalkan += 1;
            if (booking.status === "Diproses") acc.diproses += 1;
            return acc;
          },
          { disetujui: 0, dibatalkan: 0, diproses: 0 }
        );

        // Menghitung total peminjaman
        statusCounts.total = Object.values(statusCounts).reduce(
          (a, b) => a + b,
          0
        );

        setTotals(statusCounts);

        const approvedPercentage =
          (statusCounts.disetujui / statusCounts.total) * 100;
        const rejectedPercentage =
          (statusCounts.dibatalkan / statusCounts.total) * 100;

        // Update pie chart data
        setPieChartData({
          labels: ["Disetujui", "dibatalkan"],
          datasets: [
            {
              label: "Persentase Status Peminjaman",
              backgroundColor: [
                "rgba(164, 192, 245, 1)",
                "rgba(255, 46, 46, 0.33)",
              ],
              data: [approvedPercentage, rejectedPercentage],
            },
          ],
        });

        if (selectedRoom) {
          const filteredData = data.filter(
            (booking) =>
              booking.room === selectedRoom &&
              booking.status === "Disetujui" &&
              moment(booking.date).isBetween(
                moment().subtract(6, "days").startOf("day"),
                moment().endOf("day")
              )
          );
          setBookingData(filteredData);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        message.error("Error fetching bookings");
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







        <div className="dashboard-card-pie">
          <div className="title-card">Rangkuman</div>
          <div className="dashboard-card-container">
            <div className="dashboard-card">
              
              <div className="card-cardacc cardd">
                <button className="buttonku" onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="text-card-content">
                      <span className="font-number">{totals.disetujui}</span>
                      <span className="teks-card">Disetujui</span>
                    </div>
                    <EventAvailableIcon className="icon-card" />
                  </div>
                </button>
              </div>
              <div className="card-cardrejected cardd">
                <button className="buttonku" onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="text-card-content">
                      <span className="font-number">{totals.dibatalkan}</span>
                      <span className="teks-card">dibatalkan</span>
                    </div>
                    <EventBusyOutlinedIcon className="icon-card" />
                  </div>
                </button>
              </div>
              <div className="card-cardprocess cardd">
                <button className="buttonku" onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="text-card-content">
                      <span className="font-number">{totals.diproses}</span>
                      <span className="teks-card">Diproses</span>
                    </div>
                    <EventRepeatOutlinedIcon className="icon-card" />
                  </div>
                </button>
              </div>
              <div className="card-cardtotal cardd">
                <button className="buttonku" onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="text-card-content">
                      <span className="font-number">{totals.total}</span>
                      <span className="teks-card">Total</span>
                    </div>
                    <AssessmentOutlinedIcon className="icon-card" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        
        <div className="pie-chart-container">
          <div className="status-pie-chart">
            <div className="title-pie">Persentase Status</div>
            <div className="pie-chart">
              <Pie
                className="status-pie"
                ref={pieChartRef}
                data={pieChartData}
                options={pieChartOptions}
              />
            </div>
          </div>
          <div className="rooms-pie-chart">
            <div className="title-pie">Persentase Penggunaan Ruangan</div>
            <div className="pie-chart">
              <Pie
                className="room-pie"
                data={roomUsagePieChartData}
                options={roomUsagePieChartOptions}
              />
            </div>
          </div>
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
              <div className="dashboard-content-title">Instansi Paling Sering Berkunjung</div>
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
