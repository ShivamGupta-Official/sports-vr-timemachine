import React from 'react';

export function RetroCRTFilter({ enabled }) {
  if (!enabled) return null;

  return (
    <div className="crt-overlay-container">
      {/* Scanlines layer */}
      <div className="crt-scanlines" />
      {/* CRT Vignette & Screen curvature */}
      <div className="crt-vignette" />
      {/* Vintage Broadcast Watermark */}
      <div className="crt-watermark">
        <span className="rec-dot">● REC</span>
        <span className="vhs-date">JUN 25 1983 - SP 00:42:19</span>
      </div>
    </div>
  );
}
