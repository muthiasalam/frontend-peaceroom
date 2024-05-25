import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { ChevronRight, ChevronLeft } from "lucide-react";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './jadwal-calendar.css';
import moment from 'moment';
import { fetchData } from '../../../server/api'; // Sesuaikan path dengan struktur proyek Anda

const localizer = momentLocalizer(moment);

function CalendarComponent({ activeRuangan, onSelectEvent }) {
  const [eventList, setEventList] = useState([]);
  const [activeView, setActiveView] = useState('month'); // Menyimpan tampilan aktif
  const [currentDate, setCurrentDate] = useState(new Date()); // Menyimpan tanggal aktif

  useEffect(() => {
    if (activeRuangan) {
      fetchData()
        .then(data => {
          // Memfilter event berdasarkan roomId yang sesuai dengan activeRuangan
          const filteredEvents = data.filter(item => item.room === activeRuangan);
          const formattedEvents = filteredEvents.map(item => ({
            id: item.id,
            idItem: item._id,
            title: item.activity,
            start: moment(item.date).set({ hour: moment(item.start_time, 'HH:mm').hour(), minute: moment(item.start_time, 'HH:mm').minute() }).toDate(),
            end: moment(item.date).set({ hour: moment(item.end_time, 'HH:mm').hour(), minute: moment(item.end_time, 'HH:mm').minute() }).toDate(),
            instansi: item.instance,
            status: item.status,
            color: getStatusColor(item.status),
          }));
          setEventList(formattedEvents);
        })
        .catch(error => {
          console.error("Error fetching data:", error);
        });
    }
  }, [activeRuangan]); // Ubah dependency array agar pengambilan data terjadi setiap kali activeRuangan berubah

  // Fungsi untuk mendapatkan warna berdasarkan status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Diproses':
        return '#e6e6e6';
      case 'Dibatalkan':
        return '#FFA6A6';
      case 'Disetujui':
        return '#4B7BB3';
      default:
        return '#e6e6e6'; // Default jika status tidak cocok
    }
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        color: event.color === '#4B7BB3' ? 'white' : 'black', // Tulisan putih jika latar belakang biru, hitam jika merah muda
        fontSize: 14
      }
    };
  };

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      let newDate = new Date(toolbar.date);
      switch (toolbar.view) {
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
          case 'agenda':
          newDate.setDate(newDate.getDate() - 1);
          break;
        
        default:
          break;
      }
      setCurrentDate(newDate);
      toolbar.onNavigate('prev', newDate);
    };

    const goToNext = () => {
      let newDate = new Date(toolbar.date);
      switch (toolbar.view) {
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
          case 'agenda':
            newDate.setDate(newDate.getDate() + 1);
            break;
        default:
          break;
      }
      setCurrentDate(newDate);
      toolbar.onNavigate('next', newDate);
    };

    const goToToday = () => {
      const now = new Date();
      setCurrentDate(now);
      toolbar.onNavigate('today', now);
    };

    const goToView = (view) => {
      setActiveView(view); // Set tampilan aktif
      toolbar.onView(view);
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group-left">
          <button type="button" className="rbc-btn-left" onClick={goToToday}>
            Today
          </button>
          <button type="button" className="rbc-btn-left" onClick={goToBack}>
            <ChevronLeft size={14} />
          </button>
          <button type="button" className="rbc-btn-left" onClick={goToNext}>
            <ChevronRight size={14} />
          </button>
        </span>
        <span className="rbc-toolbar-label">{toolbar.label}</span>
        <span className="rbc-btn-group-right">
          <button type="button" className={activeView === 'month' ? 'active' : ''} onClick={() => goToView('month')}>
            Month
          </button>
          <button type="button" className={activeView === 'week' ? 'active' : ''} onClick={() => goToView('week')}>
            Week
          </button>
          <button type="button" className={activeView === 'day' ? 'active' : ''} onClick={() => goToView('day')}>
            Day
          </button>
          <button type="button" className={activeView === 'agenda' ? 'active' : ''} onClick={() => goToView('agenda')}>
            Agenda
          </button>
        </span>
      </div>
    );
  };

  return (
    <div style={{ height: '500px' }}>
      <Calendar
        localizer={localizer}
        events={eventList}
        startAccessor="start"
        endAccessor="end"
        style={{ width: '100%' }}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        components={{ toolbar: CustomToolbar }}
        date={currentDate} // Mengatur tanggal aktif pada Calendar
      />
    </div>
  );
}

export default CalendarComponent;
