const axios = require('axios');

async function test() {
  try {
    const res = await axios.post("https://chust-express-backend.onrender.com/api/auth/login", {
      email: "sanjarbekn08@gmail.com", // user email? I don't know the exact email, let me use a random registered email or maybe just test locally...
    });
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
