// test_extra_login.js
const axios = require('axios');

async function testLogin() {
  const payload = {
    email: 'e@gmail.com',
    password: '111111',
    extraCode: 'EXT-S/Ws36'
  };

  try {
    console.log('Testing login with:', payload);
    const response = await axios.post('http://localhost:5000/api/auth/login', payload);
    console.log('Login Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Login Failed (Status):', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
