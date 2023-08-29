const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const multer = require('multer');

const app = express();

app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();

// Azure Blob Storage setup

const sharedKeyCredential = new StorageSharedKeyCredential(process.env.AZURE_STORAGE_ACCOUNT_NAME, process.env.AZURE_STORAGE_ACCOUNT_KEY);
const blobServiceClient = new BlobServiceClient("http://127.0.0.1:10000/devstoreaccount1", sharedKeyCredential);

const upload = multer({ storage: multer.memoryStorage() }); // use memoryStorage for now

app.post('/translate', async (req, res) => {
    const { text } = req.body;

    try {
        const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en`;
        const headers = {
            'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATOR_KEY,
            'Ocp-Apim-Subscription-Region': process.env.AZURE_TRANSLATOR_REGION,
            'Content-Type': 'application/json',
        };
        const response = await axios.post(endpoint, [{ Text: text }], { headers });

        const translatedText = response.data[0].translations[0].text;
        res.json({ translatedText });
    } catch (error) {
        console.error("Translation API Error:", error);
        res.status(500).json({ success: false, message: "Translation failed" });
    }
});

app.post('/save-data', upload.single('audio'), async (req, res) => {
    const audioBuffer = req.file.buffer; // this is the audio Blob
    const audioSize = req.file.size; // this is the audio size
    const translation = req.body.text;

    const blobName = `${Date.now()}.wav`;
    const containerClient = blobServiceClient.getContainerClient("audios");
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        await blockBlobClient.upload(audioBuffer, audioSize, {
            metadata: {
                translation: translation
            }
        });

        res.status(200).json({ success: true, message: `Blob uploaded successfully with name: ${blobName}` });
    } catch (error) {
        console.error("Azure Blob Upload Error:", error);
        res.status(500).json({ success: false, message: "Failed to upload audio to Azure Blob Storage" });
    }
});

// Fetch all blob records
app.get('/get-blob', async (req, res) => {
    try {
        const containerClient = blobServiceClient.getContainerClient("audios");
        const blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            // Getting the blob content
            const blobClient = containerClient.getBlobClient(blob.name);
            const downloadBlockBlobResponse = await blobClient.download(0);
            const audioContent = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString('base64');

            blobs.push({
                ...blob,
                audioContent: `data:audio/wav;base64,${audioContent}`
            });
        }

        res.json(blobs);
    } catch (error) {
        console.error('Error fetching blobs:', error);
        res.status(500).send('Failed to fetch blobs.');
    }
});

// Helper function to convert a stream to a buffer
function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

// Delete a specific blob record
app.delete('/delete-blob/:blobName', async (req, res) => {
    const blobName = req.params.blobName;
    try {
        const containerClient = blobServiceClient.getContainerClient("audios");
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
        res.json({ success: true, message: `Blob ${blobName} deleted successfully.` });
    } catch (error) {
        console.error("Error deleting blob:", error);
        res.status(500).json({ success: false, message: "Failed to delete blob" });
    }
});

app.listen(5000, () => {
    console.log('Server started on http://localhost:5000');
});