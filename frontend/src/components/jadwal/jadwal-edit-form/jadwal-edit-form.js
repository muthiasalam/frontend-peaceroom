import React, { useState, useEffect } from 'react';
import { Select, Input, TimePicker, DatePicker, Upload, Button, Form, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { fetchData, fetchDataIns, fetchDataRo } from '../../../server/api';

const { RangePicker } = TimePicker;

export default function FormEditPengajuan({ initialData, onSubmit, onClose, onUpdate }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [instances, setInstances] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const getInstances = async () => {
      try {
        const data = await fetchDataIns();
        const instanceOptions = data.map(instance => ({
          value: instance._id,
          label: instance.name,
        }));
        setInstances(instanceOptions);
      } catch (error) {
        console.error('Error fetching instances:', error);
        message.error('Error fetching instances');
      }
    };

    getInstances();
  }, []);

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
    if (initialData) {
      const { name, instance, activity, room, conference_type, date, start_time, end_time, letter } = initialData;
      form.setFieldsValue({
        name,
        instance,
        activity,
        room,
        conference_type,
        date: moment(date),
        time: [moment(start_time, 'HH:mm'), moment(end_time, 'HH:mm')],
        letter
      });
      if (letter) {
        setFileList([{
          uid: '-1',
          name: letter,
          status: 'done',
          url: `/uploads/${letter}`
        }]);
      }
    }
  }, [initialData]);

  const handleFileChange = ({ fileList }) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    const maxSize = 1024 * 1024; // 1MB
  
    // Filter fileList to only include allowed file types and sizes
    const filteredFileList = fileList.filter(file => {
      const isAllowedType = allowedTypes.includes(file.type);
      const isAllowedSize = file.size <= maxSize;
      if (!isAllowedType) {
        message.error(`${file.name} bukan tipe file yang diizinkan. Silakan unggah file dengan tipe PDF/JPEG/JPG.`);
      }
      if (!isAllowedSize) {
        message.error(`${file.name} melebihi ukuran maksimal 1MB. Silakan unggah file dengan ukuran yang lebih kecil.`);
      }
      return isAllowedType && isAllowedSize;
    });
  
    // Check if there is already a file uploaded
    if (filteredFileList.length > 1) {
      const firstFile = filteredFileList[0];
      const secondFile = filteredFileList[1];
  
      // Remove the first file and keep the second file
      const updatedFileList = [secondFile];
      
      // Show message or perform action if desired
      message.warning(`Hanya satu file yang diizinkan. ${firstFile.name} dibatalkan dan digantikan dengan ${secondFile.name}.`);
      
      // Set the updated fileList
      setFileList(updatedFileList);
    } else {
      // If no multiple files, just set the filtered fileList
      setFileList(filteredFileList);
    }
  };
  

  const onFinish = async (formData) => {
    try {
      setIsSubmitting(true);

      const waktu = form.getFieldValue('time');
      const start_time = waktu[0].format('HH:mm');
      const end_time = waktu[1].format('HH:mm');
      const date = form.getFieldValue('date').toISOString();
      const room = form.getFieldValue('room');

      const formattedData = {
        ...formData,
        tanggal: date,
        start_time,
        end_time,
        room,
      };

      // Ambil data yang sudah ada di database
      const existingData = await fetchData();

      const isConflict = existingData.some(existing => {
        const isNotCancelled = existing.status !== 'Dibatalkan';
      
        // Tambahkan filter pengecekan konflik hanya untuk data selain dirinya sendiri
        const isNotSelf = existing._id !== initialData._id;
      
        const sameDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          existing.start_time === formattedData.start_time &&
          existing.end_time === formattedData.end_time;
      
        const overlappingDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          (
            (formattedData.start_time >= existing.start_time && formattedData.start_time < existing.end_time) ||
            (formattedData.end_time > existing.start_time && formattedData.end_time <= existing.end_time) ||
            (formattedData.start_time < existing.start_time && formattedData.end_time > existing.end_time)
          );
      
        const withinExistingDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          formattedData.start_time >= existing.start_time &&
          formattedData.end_time <= existing.end_time;
      
        const touchingDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          (
            (formattedData.start_time >= existing.start_time && formattedData.start_time < existing.end_time) ||
            (formattedData.end_time > existing.start_time && formattedData.end_time <= existing.end_time) ||
            (formattedData.start_time < existing.start_time && formattedData.end_time > existing.end_time) ||
            (formattedData.start_time === existing.end_time) ||
            (formattedData.end_time === existing.start_time)
          );
      
        return isNotCancelled && isNotSelf && (sameDateTime || overlappingDateTime || withinExistingDateTime || touchingDateTime);
      });

      if (isConflict) {
        message.error('Konflik jadwal: Pilih Ruangan atau Jadwal yang lain!');
      } else {
        const updatedFormData = {
          ...formattedData
        };

        // Tambahkan logika pengecekan perubahan jadwal
        const isDateChanged = initialData.date !== date;
        const isTimeChanged = initialData.start_time !== start_time || initialData.end_time !== end_time;
        const isRoomChanged = initialData.room !== room;

        if (isDateChanged || isTimeChanged || isRoomChanged) {
          updatedFormData.status = 'Rescheduled';
        }

        const formDataToSend = new FormData();
        Object.keys(updatedFormData).forEach(key => {
          formDataToSend.append(key, updatedFormData[key]);
        });

        if (fileList.length > 0 && fileList[0].originFileObj) {
          formDataToSend.append('letter', fileList[0].originFileObj, fileList[0].name);
        }

        const response = await axios.put(`http://localhost:3001/books/${initialData._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        onSubmit(response.data);  // Mengirim data yang diperbarui ke pemanggil
        onUpdate(response.data);  // Update the data in the parent component
        onClose();
        setIsSuccessPopupOpen(true);

        // Reset fields and update form values
        form.resetFields();
        form.setFieldsValue({
          ...form.getFieldsValue(),
          time: [moment(start_time, 'HH:mm'), moment(end_time, 'HH:mm')],
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputBlur = (fieldName, fieldLabel) => {
    const value = form.getFieldValue(fieldName);
    if (!value) {
      form.setFields([{ name: fieldName, errors: [`${fieldLabel} harus diisi`] }]);
    }
  };

  return (
    <div className='form-container'>
      <div className="frame-1">
        <div className="frame-2">
          <span className="form-pengajuan-ruangan">Form Edit Pengajuan/Pembatalan Ruangan</span>
        </div>
        <i className="fa fa-close" onClick={onClose}></i>
      </div>
      <div className='frame-3'>
        <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish}>
          <Form.Item label="Nama" name="name" rules={[{ required: true, message: 'Nama harus diisi' }]} onBlur={() => handleInputBlur('name', 'Nama')}>
            <Input placeholder="Nama" />
          </Form.Item>
          <Form.Item label="Instansi" name="instance" rules={[{ required: true, message: 'Instansi harus diisi' }]} onBlur={() => handleInputBlur('instance', 'Instansi')}>
            <Select showSearch style={{ width: '100%' }} placeholder="Pilih Instansi" options={instances} />
          </Form.Item>
          <Form.Item label="Kegiatan" name="activity" rules={[{ required: true, message: 'Kegiatan harus diisi' }]} onBlur={() => handleInputBlur('activity', 'Kegiatan')}>
            <Input placeholder="Kegiatan" />
          </Form.Item>
          <Form.Item label="Ruangan" name="room" rules={[{ required: true, message: 'Ruangan harus diisi' }]} onBlur={() => handleInputBlur('room', 'Ruangan')}>
            <Select showSearch style={{ width: '100%' }} placeholder="Pilih Ruangan" options={rooms} />
          </Form.Item>
          <Form.Item label="Jenis Kegiatan" name="conference_type" rules={[{ required: true, message: 'Jenis harus diisi' }]} onBlur={() => handleInputBlur('conference_type', 'Jenis Kegiatan')}>
            <Select style={{ width: '100%' }} placeholder="Pilih Jenis" options={[
              { value: 'Offline', label: 'Offline' },
              { value: 'Online', label: 'Online' },
            ]} />
          </Form.Item>
          <Form.Item label="Tanggal" name="date" rules={[{ required: true, message: 'Tanggal harus diisi' }]} onBlur={() => handleInputBlur('date', 'Tanggal')}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Waktu" name="time" rules={[{ required: true, message: 'Waktu harus diisi' }]} onBlur={() => handleInputBlur('time', 'Waktu')}>
            <RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Upload Surat" name="letter">
          <Upload
  fileList={fileList}
  beforeUpload={() => false} // Mencegah unggahan langsung
  onChange={handleFileChange}
  accept=".pdf,.jpeg,.jpg"
>
  <Button icon={<UploadOutlined />}>Upload (PDF/JPEG/JPG)</Button>
</Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ width: '100%', color: 'white', backgroundColor: '#1E5AA0' }}>Submit</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
