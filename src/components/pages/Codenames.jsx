import React, { useState, useEffect } from 'react';
import './Codenames.css';

function Codenames() {
  const [activePack, setActivePack] = useState(null);
  const [fileData, setFileData] = useState({});
  const [packText, setPackText] = useState('');
  const [copyNotification, setCopyNotification] = useState('');
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, left: 0 }); // Track the cursor position

  const packs = ["nico", "justin", "ethan", "david", "jack"]; // Lowercase filenames

  useEffect(() => {
    // Fetch the data from the Google Apps Script when the page loads
    const webAppUrl = 'https://script.google.com/macros/s/AKfycbxTk3od7Ax1ExyVXdYQ406zY-RK4ypXd-6bwn3eP-kQR92MhBg7_RxUwoRCi9tlpJ8/exec';

    // Fetch the JSON data from the Google Apps Script
    fetch(webAppUrl)
      .then((response) => response.json())
      .then((data) => {
        setFileData(data); // Store all packs' data in fileData
      })
      .catch((error) => {
        console.error("Error loading the pack:", error);
        setPackText("Error loading text. Please try again later.");
      });
  }, []); // Empty dependency array means this runs once when the page loads

  useEffect(() => {
    // Update packText when activePack is set
    if (activePack !== null && fileData[`${packs[activePack]}_pack`]) {
      setPackText(fileData[`${packs[activePack]}_pack`].join('\n'));
    }
  }, [activePack, fileData]); // Re-run effect when activePack or fileData changes

  const handleCombinedClick = (e) => {
    // Set the text for the "Combined" pack and copy it to clipboard
    if (fileData['combined']) {
      const combinedText = fileData['combined'].join('\n');
      setPackText(combinedText);

      // Copy to clipboard
      navigator.clipboard.writeText(combinedText).then(() => {
        // Show the notification when copied successfully
        setCopyNotification('Combined text copied to clipboard!');
        
        // Set the position of the notification based on the cursor position
        setNotificationPosition({ top: e.clientY + 10, left: e.clientX + 10 });

        // Hide the notification after 2 seconds
        setTimeout(() => {
          setCopyNotification('');
        }, 2000);
      }).catch((error) => {
        console.error("Error copying text: ", error);
        setCopyNotification('Failed to copy text to clipboard.');

        // Set the position of the notification based on the cursor position
        setNotificationPosition({ top: e.clientY + 10, left: e.clientX + 10 });

        // Hide the notification after 2 seconds
        setTimeout(() => {
          setCopyNotification('');
        }, 2000);
      });
    } else {
      setPackText('Combined data not found.');
    }
  };

  return (
    <div className="codenames-container">
      <video className="background-video" autoPlay loop muted>
        <source src="/videos/jungle_background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="sidebar">
        {packs.map((packName, index) => (
          <button key={index} className="button" onClick={() => setActivePack(index)}>
            {packName.charAt(0).toUpperCase() + packName.slice(1)} Pack
          </button>
        ))}
        
        {/* Combined button now also copies text */}
        <button className="button" onClick={(e) => handleCombinedClick(e)}>
          Combined
        </button>
      </div>

      <div className="main-content">
        {activePack !== null || packText !== '' ? (
          <textarea
            className="textbox full-height"
            placeholder="Loading just wait :DD"  // Updated placeholder
            value={packText}
            onChange={(e) => setPackText(e.target.value)} // Allow editing
          />
        ) : null}
      </div>

      {/* Display copy notification near the cursor */}
      {copyNotification && (
        <div
          className="copy-notification"
          style={{ top: `${notificationPosition.top}px`, left: `${notificationPosition.left}px` }}
        >
          {copyNotification}
        </div>
      )}
    </div>
  );
}

export default Codenames;
