const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();
const startRecognitionBtn = document.querySelector('#start-recognition-btn');
const languageSelect = document.querySelector('#language-select');

recognition.addEventListener('start', () => {
    document.querySelector('.fa-microphone').style.color = 'blue';
});

recognition.addEventListener('end', () => {
    startRecognitionBtn.disabled = false;
    document.querySelector('.fa-microphone').style.color = 'black';
});

startRecognitionBtn.addEventListener('click', () => {
    recognition.lang = languageSelect.value;
    recognition.start();
    startRecognitionBtn.disabled = true;
});

recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    translateText(transcript, languageSelect.value);
});

function translateText(text, targetLang) {
    fetch('http://localhost:3002/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            targetLang: 'en'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.translatedText) {
            alert(data.translatedText);
        } else {
            alert('Translation failed');
        }
    })
    .catch(error => {
        console.error('Error translating text:', error);
    });
}