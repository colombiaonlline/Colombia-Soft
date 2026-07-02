const axios = require('axios');
const http = require('http');

async function run() {
  try {
    const res = await axios.post('http://localhost:3000/api/config/airports', {
      name: 'Aeropuerto de Prueba',
      abbreviation: 'PRB',
      city: 'Prueba',
      country: 'Colombia',
      type: 'Nacional',
      status: 'Activo'
    }, {
      // Need a valid token here, or I can just use a user login first.
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
