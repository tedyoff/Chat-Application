const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { emailjs, port } = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: emailjs.serviceId,
        template_id: emailjs.templateId,
        user_id: emailjs.publicKey,
        template_params: {
          from_name: name,
          from_email: email,
          message,
        },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
