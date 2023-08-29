import React from 'react';
import axios from 'axios';

function RecordingsList({ recordings, setRecordings, fetchRecordings }) {
    const deleteBlob = async (blobName) => {
        try {
            await axios.delete(`http://localhost:5000/delete-blob/${blobName}`);
            setRecordings(prevRecordings => prevRecordings.filter(record => record.name !== blobName));
            // Refresh the list after deleting
            fetchRecordings();
        } catch (error) {
            console.error("Error deleting blob:", error);
        }
    }

    return (
        <div className="recordings-list">
            <h2>Recordings:</h2>
            {recordings.map(record => (
                <div key={record.name}>
                    <div>Recording Name: {record.name}</div>
                    <div>Translation: {record.metadata?.translation}</div>
                    <audio controls src={record.audioContent}></audio> {/* Use the Base64 encoded audio data */}
                    <button onClick={() => deleteBlob(record.name)}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default RecordingsList;
