import React, { useState, useEffect } from 'react';
import { Select, Input, TimePicker, DatePicker, Upload, Button, Form, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './jadwal-form.css';
import moment from 'moment';
import { fetchData, fetchDataIns, fetchDataRo } from '../../../server/api';

const { RangePicker } = TimePicker;

export default function FormPengajuan({ onSubmit, onClose }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [instances, setInstances] = useState([]); // State untuk menyimpan data instansi
  const [rooms, setRooms] = useState([]); // State untuk menyimpan data ruangan

  // Mengambil data instansi saat komponen di-mount
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

  // Mengambil data ruangan saat komponen di-mount
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

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const onFinish = async (formData) => {
    try {
      setIsSubmitting(true);

      const waktu = form.getFieldValue('time');
      const start_time = waktu[0].format('HH:mm');
      const end_time = waktu[1].format('HH:mm');
      const date = form.getFieldValue('date').toISOString();

      const formattedData = {
        ...formData,
        tanggal: date,
        start_time,
        end_time,
      };

      // Ambil data yang sudah ada di database
      const existingData = await fetchData();

       // Lakukan pengecekan konflik
       const isConflict = existingData.some(existing => {
        const sameDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          existing.start_time === formattedData.start_time &&
          existing.end_time === formattedData.end_time;

        const overlappingDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          (
            (formattedData.start_time >= existing.start_time && formattedData.start_time < existing.end_time) ||
            (formattedData.end_time > existing.start_time && formattedData.end_time <= existing.end_time) ||
            (formattedData.start_time <= existing.start_time && formattedData.end_time >= existing.end_time)
          );

        const withinExistingDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          formattedData.start_time >= existing.start_time &&
          formattedData.end_time <= existing.end_time;

        const touchingDateTime = existing.room === formattedData.room &&
          existing.date === formattedData.tanggal &&
          (
            (formattedData.start_time >= existing.start_time && formattedData.start_time < existing.end_time) ||
            (formattedData.end_time > existing.start_time && formattedData.end_time <= existing.end_time)
          );

        return sameDateTime || overlappingDateTime || withinExistingDateTime || touchingDateTime;
      });

      if (isConflict) {
        message.error('Konflik jadwal: Pilih Ruangan atau Jadwal yang lain!');
      } else {
        const updatedFormData = {
          ...formattedData,
          status: 'Diproses'
        };

        const formDataToSend = new FormData();
        Object.keys(updatedFormData).forEach(key => {
          formDataToSend.append(key, updatedFormData[key]);
        });

        if (fileList.length > 0) {
          formDataToSend.append('letter', fileList[0].originFileObj, fileList[0].name);
        }

        console.log("Data being sent to database:", updatedFormData);

        const response = await axios.post('http://localhost:3001/books/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log("Response data from database:", response.data);

        onSubmit(response.data);
        onClose();
        setIsSuccessPopupOpen(true);
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
          <span className="form-pengajuan-ruangan">Form Pengajuan/Pembatalan Ruangan</span>
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
            <RangePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item label="Surat" name="letter">
            <Upload fileList={fileList} rules={[{ required: true, message: 'File harus diisi' }]} beforeUpload={() => false} onChange={handleFileChange} accept=".pdf,.jpeg">
              <Button icon={<UploadOutlined />}>Upload (PDF/JPEG)</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ width: '100%', color: 'white', backgroundColor: '#1E5AA0' }}>
              Kirim
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
