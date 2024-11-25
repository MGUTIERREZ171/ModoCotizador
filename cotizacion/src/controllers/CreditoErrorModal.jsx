import React from 'react';

export const CreditoErrorModal = ({ title, message, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
            zIndex: 1000
        }}>
            <h2>{title}</h2>
            <ul>
                {(Array.isArray(message) ? message : []).map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
            <button onClick={onClose}>Cerrar</button>
        </div>
    );
};
