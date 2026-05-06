const axios = require('axios');

async function main() {
  try {
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'ext_test_user',
      email: 'extest@example.com',
      password: 'password123',
      cardNumber: '86000000',
      address: 'Test Addr',
      phoneNumber: '+998901234567'
    });
    console.log('Register success:', registerResponse.data.data.email);
    
    // Login with same
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'extest@example.com',
      password: 'password123',
      extraCode: 'ANY_CODE' // Test activation
    });
    console.log('Login success:', loginResponse.data.role);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}
main();
