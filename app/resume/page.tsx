import './Resume.css';

export default function ResumePage() {
  return (
    <div className="pdf-container">
      <embed
        src="/images/resume_2026feb.pdf"
        type="application/pdf"
        height={1000}
        width="100%"
      />
    </div>
  );
}
