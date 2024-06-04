import React, { useState, useEffect } from "react";
import { Select } from "antd";
import PopupDelete from "../../peminjaman-popup-delete/peminjaman-popup-delete";
import { fetchDataIns, fetchDataRo, updateStatusV2, deleteData } from "../../../../server/api";
import useTable from "../../../../utils/peminjaman/peminjaman-tabel";
import "./peminjaman-tabel-content.css";
import TableFooter from "../peminjaman-tabel-page/peminjaman-tabel-page";

const Table = ({ data, rowsPerPage, updateDataStatus, deleteData, onSelect }) => {
  const [page, setPage] = useState(1);
  const { slice, range } = useTable(data, page, rowsPerPage);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [instances, setInstances] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('semua');

  useEffect(() => {
    const getInstances = async () => {
      try {
        const fetchedInstances = await fetchDataIns();
        setInstances(fetchedInstances);
      } catch (error) {
        console.error("Error fetching instances:", error);
      }
    };

    const getRooms = async () => {
      try {
        const fetchedRooms = await fetchDataRo();
        setRooms(fetchedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    getInstances();
    getRooms();
  }, []);

  const handleDelete = (id) => {
    setSelectedDeleteId(id);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    deleteData(selectedDeleteId);
    setShowDeletePopup(false);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
  };

  const handleStatusChange = async (id, newStatus, letter) => {
    try {
      await updateDataStatus(id, newStatus, letter);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const findInstanceName = (id) => {
    const instance = instances.find(inst => inst._id === id);
    return instance ? instance.name : id;
  };

  const findRoomName = (id) => {
    const room = rooms.find(rm => rm._id === id);
    return room ? room.name : id;
  };

  const filteredData = filter === 'hariIni' 
    ? data.filter(item => {
        const itemDate = new Date(item.date).toLocaleDateString('id-ID');
        const todayDate = new Date().toLocaleDateString('id-ID');
        return itemDate === todayDate;
      }) 
    : data;

  return (
    <>
    <div className="filter-button-container">
      <div className="filter-buttons">
        <button 
          className={`filter-button ${filter === 'semua' ? 'active' : ''}`} 
          onClick={() => setFilter('semua')}
        >
          Semua
        </button>
        <button 
          className={`filter-button ${filter === 'hariIni' ? 'active' : ''}`} 
          onClick={() => setFilter('hariIni')}
        >
          Hari Ini
        </button>
      </div></div>
      <div className="table-container">
        
        <table className="table">
          <thead className="tableRowHeader">
            <tr>
              <th className="tableHeader">Tanggal</th>
              <th className="tableHeader">Jam</th>
              <th className="tableHeader">Ruangan</th>
              <th className="tableHeader">Agenda</th>
              <th className="tableHeader">Instansi</th>
              <th className="tableHeader">Status</th>
              <th className="tableHeader">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((el) => (
              <TableRow
                key={el._id}
                el={el}
                handleStatusChange={handleStatusChange}
                handleDelete={handleDelete}
                onSelect={() => onSelect(el)}
                findInstanceName={findInstanceName}
                findRoomName={findRoomName}
              />
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter range={range} slice={slice} setPage={setPage} page={page} />

      {showDeletePopup && (
        <div className="popup-container">
          <div className="popup">
            <PopupDelete onCancel={handleCancelDelete} onDelete={handleConfirmDelete} />
          </div>
        </div>
      )}
    </>
  );
};

const TableRow = ({ el, handleStatusChange, handleDelete, onSelect, findInstanceName, findRoomName }) => {
  const { _id, date, start_time, end_time, room, activity, instance, status, letter } = el;
  const [selectedStatus, setSelectedStatus] = useState(status);

  const statusOptions = [
    { value: 'Diproses', label: 'Diproses' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Dibatalkan', label: 'Dibatalkan' },
  ];

  const handleStatusSelect = async (value) => {
    setSelectedStatus(value);
    await handleStatusChange(_id, value, letter);
  };

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const jamFormatted = `${start_time} - ${end_time}`;

  return (
    <tr className="tableRowItems">
      <td className="tableCell">{formattedDate}</td>
      <td className="tableCell">{jamFormatted}</td>
      <td className="tableCell">{findRoomName(room)}</td>
      <td className="tableCell">{activity}</td>
      <td className="tableCell">{findInstanceName(instance)}</td>
      <td className="tableCell">
        <Select
          style={{ width: "90%" }}
          options={statusOptions}
          value={statusOptions.find(option => option.value === selectedStatus)?.value}
          onChange={handleStatusSelect}
        />
      </td>
      <td className="tableCell">
        <div className="button-container-tabel">
          <button className="button-instance button-detail" onClick={onSelect}>
            <i className="fa-solid fa-eye"></i>
          </button>
          <button className="button-instance button-delete" onClick={() => handleDelete(_id)}>
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Table;
