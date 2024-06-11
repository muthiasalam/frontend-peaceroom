import React, { useState, useEffect, useRef } from "react";
import { message, Button } from "antd";
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
import { Line, Bar, Pie } from 'react-chartjs-2';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart, ArcElement } from "chart.js";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import Papa from "papaparse";
Chart.register(ArcElement);

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
  const [bookingData, setBookingData] = useState([]);
  const [allBookingData, setAllBookingData] = useState([]);
  const [instances, setInstances] = useState([]);
  const [bookingDataThisYear, setBookingDataThisYear] = useState([]);

  const [totals, setTotals] = useState({
    disetujui: 0,
    ditolak: 0,
    direschedule: 0,
    total: 0,
  });
  const [pieChartData, setPieChartData] = useState({
    labels: ["Disetujui", "Ditolak"],
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
  const { isLoggedIn, username } = useAuth();
  const roomPieChartRef = useRef(null);
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
            if (booking.status === "Ditolak" || booking.status === "Dibatalkan")
              acc.ditolak += 1;
            if (booking.status === "Rescheduled") acc.direschedule += 1;
            return acc;
          },
          { disetujui: 0, ditolak: 0, direschedule: 0 }
        );

        // Menghitung total peminjaman
        statusCounts.total =
          statusCounts.disetujui +
          statusCounts.ditolak +
          statusCounts.direschedule;

        setTotals(statusCounts);

        const approvedRescheduledPercentage =
          ((statusCounts.disetujui + statusCounts.direschedule) /
            statusCounts.total) *
          100;
        const rejectedPercentage =
          (statusCounts.ditolak / statusCounts.total) * 100;

        // Update pie chart data
        setPieChartData({
          labels: ["Disetujui", "Ditolak"],
          datasets: [
            {
              label: "Persentase Status Peminjaman",
              backgroundColor: [
                "rgba(164, 192, 245, 1)",
                "rgba(255, 46, 46, 0.33)",
              ],
              data: [approvedRescheduledPercentage, rejectedPercentage],
            },
          ],
        });

        const last7Days = Array.from({ length: 7 }, (_, i) => moment().subtract(i, 'days').format('YYYY-MM-DD')).reverse();
        const roomData = rooms.map(room => {
          const roomBookings = data.filter(booking => 
            booking.room === room.value && 
            (booking.status === "Disetujui" || booking.status === "Rescheduled")
          );
          const dataCounts = last7Days.map(day => roomBookings.filter(booking => moment(booking.date).format('YYYY-MM-DD') === day).length);
          return {
            label: room.label,
            data: dataCounts,
            total: roomBookings.length
          };
        });

        setBookingData(roomData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        message.error('Error fetching bookings');
      }
    };

    getBookings();
  }, [rooms]);

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

  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => moment().subtract(i, 'days').format('YYYY-MM-DD')).reverse();
    const chartData = {
      labels: last7Days,
      datasets: bookingData.map((room, index) => ({
        label: room.label,
        data: room.data,
        borderColor: `hsl(${(index * 50) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(index * 50) % 360}, 70%, 50%, 0.2)`,
      })),
    };
    return chartData;
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
      if ((booking.status === "Disetujui" || booking.status === "Rescheduled") && moment(booking.date).isBefore(moment())) { // Mengambil data dengan status "Disetujui" atau "Rescheduled"
        acc[booking.instance] = (acc[booking.instance] || 0) + 1;
      }
      return acc;
    }, {});
  
    const sortedInstances = Object.entries(instanceCounts).sort((a, b) => b[1] - a[1]);
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

  const exportDataToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + convertArrayToCSV(allBookingData);
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "booking_data.csv");
    document.body.appendChild(link);
    link.click();
  };
  
  const convertArrayToCSV = (data) => {
    // Membuat header CSV
    const header = "name,instance,conference_type,start_time,end_time,status,room,date\n";
  
    // Mengonversi data menjadi baris-baris CSV
    const csv = data.map(row => {
      // Mengonversi nilai instance ke nama instance menggunakan _id sebagai referensi
      const instanceName = instances.find(instance => instance._id === row.instance)?.name || 'Unknown';
  
      // Mengonversi nilai room ke nama room menggunakan _id sebagai referensi
      const roomName = rooms.find(room => room.value === row.room)?.label || 'Unknown';
  
      // Mengambil data yang diperlukan
      const rowData = [
        row.name,
        instanceName,
        row.conference_type,
        row.start_time,
        row.end_time,
        row.status,
        roomName,
        row.date // Menggunakan tanggal yang sudah diformat
      ];
  
      // Menggabungkan data menjadi string CSV
      return rowData.join(",");
    }).join("\n");
  
    // Mengembalikan header dan data CSV yang sudah digabung
    return header + csv;
  };

  useEffect(() => {
    const getBookingsThisYear = async () => {
      try {
        const data = await fetchData();
        const bookingsThisYear = data.filter(booking => moment(booking.date).format('YYYY') === moment().format('YYYY'));
        setBookingDataThisYear(bookingsThisYear);
      } catch (error) {
        console.error('Error fetching bookings for this year:', error);
        message.error('Error fetching bookings for this year');
      }
    };

    getBookingsThisYear();
  }, []);

  const exportDataThisYearToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + convertArrayToCSV(bookingDataThisYear);
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "booking_data_this_year.csv");
    document.body.appendChild(link);
    link.click();
  };

  const exportChartToPDF = (chartId, title, info) => {
    const chartElement = document.getElementById(chartId);
  
    html2canvas(chartElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
  
      pdf.setFontSize(12); // Mengatur ukuran font menjadi 14px
      pdf.text(title, 10, 10); // Menambahkan judul ke PDF di posisi (10, 10)
      pdf.addImage(imgData, 'PNG', 10, 30, 190, 100); // Menambahkan gambar grafik ke PDF di posisi (10, 30) dengan ukuran 190x100
  
      // Menambahkan informasi tambahan ke PDF di bawah gambar grafik
      const textYPosition = 140; // Mengatur posisi Y untuk teks info di bawah gambar
      pdf.text(info, 10, textYPosition);
  
      pdf.save(`${title}.pdf`); // Menyimpan file PDF dengan nama yang sesuai dengan judul
    });
  };
  
  const getBookingInfo = () => {
    return bookingData.map(room => `${room.label}: ${room.total}`).join('\n');
  };

  const getInstanceInfo = () => {
    const instanceData = generateInstanceChartData();
    return instanceData.labels.map((label, index) => `${label}: ${instanceData.datasets[0].data[index]}`).join('\n');
  };


  const handleExportPDF = async () => {
    const pieChartCanvas = pieChartRef.current.firstChild;
    const roomPieChartCanvas = roomPieChartRef.current.firstChild;
    const pieChartCanvasImage = await html2canvas(pieChartCanvas);
    const roomPieChartCanvasImage = await html2canvas(roomPieChartCanvas);
    const pieChartImgData = pieChartCanvasImage.toDataURL("image/png");
    const roomPieChartImgData = roomPieChartCanvasImage.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(pieChartImgData, "PNG", 30, 20, 150, 150);
    pdf.text(
      `Persentase Peminjaman Disetujui: ${pieChartData.datasets[0].data[0].toFixed(
        2
      )}%`,
      10,
      220
    );
    pdf.text(
      `Persentase Peminjaman Ditolak: ${pieChartData.datasets[0].data[1].toFixed(
        2
      )}%`,
      10,
      200
    );
    pdf.addPage();
    pdf.addImage(roomPieChartImgData, "PNG", 30, 20, 150, 150);

    let meetingRoomUsage = 0;
    let controlRoomUsage = 0;
    roomUsageData.forEach((room) => {
      const roomPercentage = parseFloat(room.percentage);
      if (room.name.toLowerCase().includes("rapat")) {
        meetingRoomUsage += roomPercentage;
      } else if (room.name.toLowerCase().includes("control")) {
        controlRoomUsage += roomPercentage;
      }
    });

    pdf.text(
      `Persentase Penggunaan Ruang Rapat: ${meetingRoomUsage.toFixed(2)}%`,
      10,
      220
    );
    pdf.text(
      `Persentase Penggunaan Ruang Control: ${controlRoomUsage.toFixed(2)}%`,
      10,
      200
    );

    pdf.save("charts.pdf");
  };

  const handleButtonClick = () => {
    navigate("/peminjaman");
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
          <div className="title-aside">
          <Button type="primary"
              onClick={exportDataToCSV}
              
            >
              Export All Data CSV
            </Button>
            <Button
              type="primary"
              onClick={exportDataThisYearToCSV}
              >
          
              Export This Year's Data CSV
            </Button>
        </div></div>
        <div className="dashboard-card-pie">
          <div className="title-card">Rangkuman peminjaman</div>
          <div className="dashboard-card-container">
            <div className="dashboard-card">
              <div className="card-cardacc">
                <button onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="text-card-content">
                      <span className="font-number">{totals.disetujui}</span>
                      <span className="teks-card">Disetujui</span>
                    </div>
                    <EventAvailableIcon className="icon-card" />
                  </div>
                </button>
              </div>
              <div className="card-cardrejected">
                <button onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="text-card-content">
                      <span className="font-number">{totals.ditolak}</span>
                      <span className="teks-card">Ditolak</span>
                    </div>
                    <EventBusyOutlinedIcon className="icon-card" />
                  </div>
                </button>
              </div>
              <div className="card-cardprocess">
                <button onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="text-card-content">
                      <span className="font-number">{totals.direschedule}</span>
                      <span className="teks-card">Reschedule</span>
                    </div>
                    <EventRepeatOutlinedIcon className="icon-card" />
                  </div>
                </button>
              </div>
              <div className="card-cardtotal">
                <button onClick={handleButtonClick}>
                  <div className="button-card-content">
                    <div className="total-card-content">
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
            <div className="pie-chart" ref={pieChartRef}>
              <Pie
                className="status-pie"
                data={pieChartData}
                options={pieChartOptions}
              />
            </div>
            <Button
              type="primary"
              onClick={handleExportPDF}
              style={{ marginTop: "10px" }}
            >
              Export PDF
            </Button>
          </div>
          <div className="rooms-pie-chart">
            <div className="title-pie">Persentase Penggunaan Ruangan</div>
            <div className="pie-chart" ref={roomPieChartRef}>
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
            </div>
            <div className="dashboard-content-chart" id="chart1">
              <div className="chart-frekuensi">
                <Line data={generateChartData()} options={chartOptions} />
              </div>
              
            </div>
            <Button type="primary" style={{ marginTop: "10px" }} onClick={() => {
  const info = getBookingInfo();
  exportChartToPDF('chart1', 'Statistik Penggunaan Ruangan Minggu Ini', info);
}}>
  Ekspor PDF
</Button>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-content-top">
              <div className="dashboard-content-title">5 Instansi Paling Sering Berkunjung</div>
            </div>
            <div className="dashboard-content-chart" id="chart2">
              <div className="chart-frekuensi">
                <Bar data={generateInstanceChartData()} options={instanceChartOptions} />
              </div>
              
            </div>
            <Button type="primary" style={{ marginTop: "10px" }} onClick={() => {
  const info = getInstanceInfo();
  exportChartToPDF('chart2', '5 Instansi Paling Sering Berkunjung', info);
}}>
  Ekspor PDF
  </Button>
          </div>
        </div>
      </main>
    </div>
  
  );
}
