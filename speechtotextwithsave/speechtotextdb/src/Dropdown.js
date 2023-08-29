import React from 'react';


const Dropdown = ({ onLanguageChange }) => {
    return (
        <select className="dropdown" onChange={e => onLanguageChange(e.target.value)}>
            <option value="en-US">English</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="hi-IN">Hindi</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="ar-SA">Arabic</option>
        </select>
    );
};


export default Dropdown;
