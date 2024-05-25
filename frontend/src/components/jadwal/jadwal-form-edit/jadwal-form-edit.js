import React, { useState, useEffect } from 'react';
import { Select, Input, TimePicker, DatePicker, Upload, message, Button, Form } from "antd";
import './jadwal-form-edit.css';
import { fetchData } from '../../../server/api';
import moment from 'moment/moment';


const { RangePicker } = TimePicker;
const props = {
  headers: {
    authorization: 'authorization-text',
  },
  action: 'https://run.mocky.io/v3/264b9734-3758-4b02-822e-0df3be99661d',
  name: 'file',
};

export default function FormEditPengajuan({ onSubmit, onClose, initialData }) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  

 // Set initial values for form fields based on initialData
 useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        jenissurat: initialData.jenissurat,
        nama: initialData.nama,
        instansi: initialData.instansi,
        agenda: initialData.agenda,
        Ruangan: initialData.Ruangan,
        jenis: initialData.jenis,
        tanggal: moment(initialData.tanggal, 'DD/MM/YYYY'),
        jam: [
          moment(initialData.jam[0], 'HH:mm:ss'),
          moment(initialData.jam[1], 'HH:mm:ss')
        ],
        surat: initialData.surat,
      });
    }
  }, [initialData]);

  const onFinish = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Ubah format tanggal dan waktu sebelum dikirim
      const formattedData = {
        ...formData,
        tanggal: formData.tanggal.format('DD/MM/YYYY'),
        jam: formData.jam.map(time => time.format('HH:mm:ss')),
      };
      
      // Ambil data yang sudah ada di database
      const existingData = await fetchData();
  
      // Lakukan pengecekan konflik
      const isConflict = existingData.some(existing => {
        // Cek apakah ada data dengan ruangan, tanggal, dan jam yang sama persis
        const sameDateTime = existing.Ruangan === formattedData.Ruangan &&
          existing.tanggal === formattedData.tanggal &&
          existing.jam.some(time => formattedData.jam.includes(time));
  
        // Cek apakah ada rentang waktu yang tumpang tindih
        const overlappingDateTime = existing.Ruangan === formattedData.Ruangan &&
          existing.tanggal === formattedData.tanggal &&
          existing.jam.some(existingTime => {
            const [existingStart, existingEnd] = existingTime.split('-').map(time => new Date(`01/01/2000 ${time}`));
            return formattedData.jam.some(newTime => {
              const [newStart, newEnd] = newTime.split('-').map(time => new Date(`01/01/2000 ${time}`));
              return (newStart < existingEnd && newEnd > existingStart);
            });
          });
  
       // Cek apakah rentang waktu data baru sepenuhnya berada dalam rentang waktu data yang sudah ada
  const withinExistingDateTime = existing.Ruangan === formattedData.Ruangan &&
  existing.tanggal === formattedData.tanggal &&
  existing.jam.some(existingTime => {
    const [existingStart, existingEnd] = existingTime.split('-').map(time => new Date(`01/01/2000 ${time}`));
    const [newStart, newEnd] = formattedData.jam[0].split('-').map(time => new Date(`01/01/2000 ${time}`));
    return (newStart >= existingStart && newEnd <= existingEnd);
  });

  const touchingDateTime = existing.Ruangan === formattedData.Ruangan &&
  existing.tanggal === formattedData.tanggal &&
  existing.jam.some(existingTime => {
    const [existingStart, existingEnd] = existingTime.split('-').map(time => new Date(`01/01/2000 ${time}`));
    const [newStart, newEnd] = formattedData.jam[0].split('-').map(time => new Date(`01/01/2000 ${time}`));
    return (newStart >= existingStart && newStart < existingEnd) || (newEnd > existingStart && newEnd <= existingEnd);
  });

return sameDateTime || overlappingDateTime || withinExistingDateTime || touchingDateTime;
      });
  
      if (isConflict) {
        message.error('Konflik: Ruangan dan jadwal sudah terisi pada waktu tersebut.');
      } else {
        // Lanjutkan dengan menyubmit data jika tidak ada konflik
        await onSubmit(formattedData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };
  
  

  const handleUploadChange = (response) => {
    setUploading(false);
    if (response.file.status !== 'uploading') {
      console.log(response.file, response.fileList);
    }
    if (response.file.status === 'done') {
      message.success(`${response.file.name} file uploaded successfully`);
    } else if (response.file.status === 'error') {
      message.error(`${response.file.name} file upload failed.`);
    }
  };

  const handleBeforeUpload = () => {
    setUploading(true);
    return true;
  };

  // Fungsi untuk memeriksa apakah input kosong setelah kehilangan fokus
  const handleInputBlur = (fieldName) => {
    const value = form.getFieldValue(fieldName);
    if (!value) {
      form.setFields([{ name: fieldName, errors: ['Harus diisi'] }]);
    }
  };

  return (
    <div className='form-container'>
      <div className="frame-1">
        <div className="frame-2">
          <span className="form-pengajuan-ruangan">
            Form Pengajuan/Pembatalan Ruangan
          </span>
        </div>
        <i className="fa fa-close" onClick={onClose}></i>
      </div>
      <div className='frame-3'>
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
         
        >
          <Form.Item
            label="Jenis Surat"
            name="jenissurat"
            rules={[{ required: true, message: 'Jenis Surat harus diisi' }]}
          >
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Pilih Jenis Surat"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              onBlur={() => handleInputBlur('jenissurat')} // Panggil fungsi saat kehilangan fokus dari input
              options={[
                { value: 'Pengajuan', label: 'Pengajuan' },
                { value: 'Pembatalan', label: 'Pembatalan' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Nama"
            name="nama"
            rules={[{ required: true, message: 'Nama harus diisi' }]}
            onBlur={() => handleInputBlur('nama')}
          >
            <Input placeholder="Nama" />
          </Form.Item>
          <Form.Item
            label="Instansi"
            name="instansi"
            rules={[{ required: true, message: 'Instansi harus diisi' }]}
            onBlur={() => handleInputBlur('instansi')}
          >
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Pilih Instansi"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              options={[
                { value: 'Instansi XYZ', label: 'Instansi XYZ' },
                { value: 'Instansi GYH', label: 'Instansi GYH' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Kegiatan"
            name="agenda"
            rules={[{ required: true, message: 'Kegiatan harus diisi' }]}
            onBlur={() => handleInputBlur('agenda')}
          >
            <Input placeholder="Kegiatan" />
          </Form.Item>
          <Form.Item
            label="Ruangan"
            name="Ruangan"
            rules={[{ required: true, message: 'Ruangan harus diisi' }]}
            onBlur={() => handleInputBlur('Ruangan')}
          >
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Pilih Ruangan"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              options={[
                { value: 'Ruangan 1', label: 'Ruangan 1' },
                { value: 'Ruangan 2', label: 'Ruangan 2' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Jenis"
            name="jenis"
            rules={[{ required: true, message: 'Jenis harus diisi' }]}
            onBlur={() => handleInputBlur('jenis')}
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Pilih Jenis"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              options={[
                { value: 'Offline', label: 'Offline' },
                { value: 'Online', label: 'Online' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Tanggal"
            name="tanggal"
            rules={[{ required: true, message: 'Tanggal harus diisi' }]}
            onBlur={() => handleInputBlur('tanggal')}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            label="Waktu"
            name="jam"
            rules={[{ required: true, message: 'Waktu harus diisi' }]}
            onBlur={() => handleInputBlur('waktu')}
          >
            <RangePicker style={{ width: '100%' }}  />
          </Form.Item>
          <Form.Item
            label="Surat"
            name="surat"
           
          >
            <Upload {...props}
              onChange={handleUploadChange}
              beforeUpload={handleBeforeUpload}
            >
              <Button loading={uploading}>Upload File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            
          <Button
          
          type="primary"
  htmlType="submit"
  loading={isSubmitting}
  style={{ width: '100%', color: 'white', backgroundColor: '#1E5AA0' }}
              
              
            >
              Kirim
            </Button>
          
          </Form.Item>

        </Form>
      </div>
    </div>
  );
}
