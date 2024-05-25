import moment from 'moment';

const convertDateTime = (date, time) => {
  const formattedDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
  const formattedTime = time.map(t => moment(t, 'HH:mm').format('HH:mm:ss'));
  return { formattedDate, formattedTime };
};

export default convertDateTime;