import React from 'react';
import './Resume.css';

function Resume() {
  return (
    <div className="pdf-container">
        <embed src='/images/Resume_May_2024.pdf' type="application/pdf" height="1000px"
        width="100%" center />
    </div>
  );
}

export default Resume;