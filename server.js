require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');



const app = express();
const PORT = 3002;
const AZURE_TRANSLATOR_ENDPOINT = `${process.env.AZURE_ENDPOINT}translate?api-version=3.0`;
const AZURE_TRANSLATOR_KEY = process.env.AZURE_API_KEY;
const AZURE_TRANSLATOR_REGION =  process.env.AZURE_TRANSLATOR_REGION;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/translate', async (req, res) => {
    const { text, targetLang } = req.body;

    try {
        const headers = {
            'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
            'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
            'Content-type': 'application/json'
        };

        const response = await axios.post(AZURE_TRANSLATOR_ENDPOINT + `&to=${targetLang}`, [{
            text: text
        }], { headers });


        const translation = response.data[0].translations[0].text;
        res.json({ translatedText: translation });
        
    } catch (error) {
        console.error('Error translating text:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Loaded Azure Endpoint:', process.env.AZURE_ENDPOINT);
});