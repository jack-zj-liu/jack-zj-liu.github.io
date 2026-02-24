import React from 'react';
import './Resume.css';

function Resume() {
  return (
    <div className="pdf-container">
        <embed src="/images/resume_2026feb.pdf" type="application/pdf" height="1000px"
        width="100%" center />
    </div>
  );
}

export default Resume;