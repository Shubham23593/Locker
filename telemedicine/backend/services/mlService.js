const axios = require('axios');

const ML_API_URL = 'http://localhost:5001';

const predictDuration = async (patientData) => {
  try {
    const { age, symptoms, emergencyLevel, previousVisits } = patientData;
    const response = await axios.post(`${ML_API_URL}/predict`, {
      age,
      symptoms,
      emergencyLevel,
      previousVisits,
    });
    return response.data.predictedDuration;
  } catch (err) {
    console.error('ML predictDuration error:', err.message);
    return 15;
  }
};

const predictSpecialization = async (symptoms) => {
  try {
    const response = await axios.post(`${ML_API_URL}/predict-specialization`, {
      symptoms,
    });
    return response.data.specialization;
  } catch (err) {
    console.error('ML predictSpecialization error:', err.message);
    return 'General';
  }
};

module.exports = { predictDuration, predictSpecialization };
