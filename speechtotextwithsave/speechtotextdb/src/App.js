import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecordButton from './RecordButton';
import RecordingsList from './RecordingsList';
import Dropdown from './Dropdown';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [hasResults, setHasResults] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [recordings, setRecordings] = useState([]);

  // Fetch recordings on component mount
  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-blob');
      setRecordings(response.data);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      alert("Error fetching recordings. Check console for more details.");
    }
  };

  const onLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
  };

  const onRecordingComplete = (audioBlob, audioURL) => {
    setAudioBlob(audioBlob);
    setAudioURL(audioURL);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('text', text);

    try {
      const response = await axios.post('http://localhost:5000/save-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert("Recording saved successfully!");
        fetchRecordings(); // Fetch the updated list of recordings
        setText('');
        setAudioBlob(null);
      } else {
        alert("Error while saving data.");
      }
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Error while uploading. Check console for more details.");
    }
  };

  return (
    <div className="App">
      <div className="card">
        <div className="title">Speech to Text Demo</div>
        <form onSubmit={onSubmit}>
          <label className="label">Choose Language:</label>
          <Dropdown onLanguageChange={onLanguageChange} />
          <RecordButton
            setText={setText}
            setHasResults={setHasResults}
            language={language}
            onRecordingComplete={onRecordingComplete}
          />
          {hasResults && <div>Transcribed text in English: {text}</div>}
          {audioURL && (
            <div>
              <audio controls src={audioURL}>Your browser does not support the audio element.</audio>
            </div>
          )}
          {audioBlob && <button className="button" type="submit">Save</button>}
          <RecordingsList recordings={recordings} setRecordings={setRecordings} fetchRecordings={fetchRecordings} />
        </form>
      </div>
    </div>
  );
}

export default App;
