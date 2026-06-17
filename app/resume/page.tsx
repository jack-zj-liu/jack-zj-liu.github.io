import './Resume.css';

export default function ResumePage() {
  return (
    <div className="pdf-container">
      <div className="pdf-toolbar">
        <a href="/images/resume_2026feb.pdf" target="_blank" rel="noopener noreferrer" className="pdf-open-link">
          open/download pdf
        </a>
      </div>
      <embed src="/images/resume_2026feb.pdf" type="application/pdf" />
    </div>
  );
}
