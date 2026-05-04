const axios = require('axios');

async function main() {
  try {
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'extest@example.com',
      password: 'password123',
      extraCode: 'ANY_CODE'
    });
    console.log('Login success:', loginResponse.data.role);
    console.log(loginResponse.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}
main();
