'use client';

import { useState, useEffect } from 'react';
import './Codenames.css';

const PACKS = ['nico', 'justin', 'ethan', 'david', 'jack'];
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxHm7wiez7n8YiCq3Po-ywNRH7MwMgqcychX9CMFjLNkTmRDla51lGge0X39FquVWZP/exec';

function normalizeApiResponse(payload: unknown): Record<string, string[]> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('invalid API response');
  }

  const response = payload as Record<string, unknown>;
  const maybeData = response.data;
  const source =
    maybeData && typeof maybeData === 'object'
      ? (maybeData as Record<string, unknown>)
      : response;

  const normalized: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      normalized[key] = value.map((entry) => String(entry));
    }
  }

  if (Object.keys(normalized).length === 0) {
    throw new Error('no pack data found in API response');
  }

  return normalized;
}

export default function CodenamesPage() {
  const [activePack, setActivePack] = useState<number | null>(null);
  const [fileData, setFileData] = useState<Record<string, string[]>>({});
  const [packText, setPackText] = useState('');
  const [copyNotification, setCopyNotification] = useState('');
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const res = await fetch(WEB_APP_URL);
        if (!res.ok) {
          throw new Error(`request failed with HTTP ${res.status}`);
        }

        const contentType = res.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(`unexpected response type: ${contentType || 'unknown'}`);
        }

        const data = await res.json();
        const normalized = normalizeApiResponse(data);
        setFileData(normalized);
      } catch (err) {
        console.error('Error loading the pack:', err);
        const message = err instanceof Error ? err.message : 'unknown error';
        setPackText(`error loading text: ${message}`);
      }
    };

    loadPacks();
  }, []);

  useEffect(() => {
    if (activePack !== null && fileData[`${PACKS[activePack]}_pack`]) {
      setPackText(fileData[`${PACKS[activePack]}_pack`].join('\n'));
    }
  }, [activePack, fileData]);

  const handleCombinedClick = (e: React.MouseEvent) => {
    if (fileData['combined']) {
      const combinedText = fileData['combined'].join('\n');
      setPackText(combinedText);
      navigator.clipboard.writeText(combinedText)
        .then(() => {
          setCopyNotification('combined text copied to clipboard!');
          setNotificationPosition({ top: e.clientY + 10, left: e.clientX + 10 });
          setTimeout(() => setCopyNotification(''), 2000);
        })
        .catch(() => {
          setCopyNotification('failed to copy text to clipboard.');
          setNotificationPosition({ top: e.clientY + 10, left: e.clientX + 10 });
          setTimeout(() => setCopyNotification(''), 2000);
        });
    } else {
      setPackText('combined data not found.');
    }
  };

  return (
    <div className="codenames-container">
      <video className="background-video" autoPlay loop muted playsInline>
        <source src="/videos/jungle_background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="sidebar">
        {PACKS.map((packName, index) => (
          <button key={packName} type="button" className="button" onClick={() => setActivePack(index)}>
            {packName} pack
          </button>
        ))}
        <button type="button" className="button" onClick={handleCombinedClick}>
          combined
        </button>
      </div>

      <div className="main-content">
        {(activePack !== null || packText !== '') && (
          <textarea
            className="textbox full-height"
            placeholder="loading just wait :DD"
            value={packText}
            onChange={(e) => setPackText(e.target.value)}
          />
        )}
      </div>

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
