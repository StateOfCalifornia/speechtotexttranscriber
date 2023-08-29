import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

const RecordButton = ({ setText, setHasResults, language, onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = language;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorderRef.current = new MediaRecorder(stream);

                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const audioURL = URL.createObjectURL(audioBlob);
                    onRecordingComplete(audioBlob, audioURL); // Callback to provide blob and URL
                };

                mediaRecorderRef.current.start();
            });

        recognition.onstart = () => {
            audioChunksRef.current = [];
            setIsRecording(true);
        };

        recognition.onresult = async (event) => {
            const originalText = event.results[0][0].transcript;
            const response = await axios.post('http://localhost:5000/translate', {
                text: originalText,
                targetLanguage: language
            });

            const translatedText = response.data.translatedText;
            setText(translatedText);
            setHasResults(true);
            setIsRecording(false);  // Stop the recording state after getting result
            mediaRecorderRef.current.stop();  // Stop the media recorder
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop all tracks in the stream

        };

        recognition.onerror = () => {
            setHasResults(false);
            setIsRecording(false); // Stop recording state on error
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        };

        recognition.start();
    };

    return (
        <button type="button" className="button" onClick={startRecording}>
            <FontAwesomeIcon icon={faMicrophone} className={`microphone-icon ${isRecording ? 'blinking' : ''}`} />
            Record
        </button>
    );
};

export default RecordButton;
