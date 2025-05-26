import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaShareAlt, FaFacebook, FaTwitter, FaLinkedin, FaLink, FaCheck } from 'react-icons/fa';
import './SocialSharing.css';

const SocialSharing = ({ url, title }) => {
  const { isDark } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <FaFacebook />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Twitter',
      icon: <FaTwitter />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }
  ];

  const handleShare = (shareUrl) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className={`social-sharing ${isDark ? 'dark-theme' : ''}`}>
      <div className="sharing-header">
        <FaShareAlt className="sharing-icon" />
        <h3>Share this product</h3>
      </div>

      <div className="share-options">
        {shareOptions.map((option) => (
          <button
            key={option.name}
            className="share-button"
            onClick={() => handleShare(option.url)}
            aria-label={`Share on ${option.name}`}
          >
            {option.icon}
            <span>{option.name}</span>
          </button>
        ))}
      </div>

      <div className="share-link">
        <input
          type="text"
          value={url}
          readOnly
          aria-label="Share link"
        />
        <button
          className="copy-button"
          onClick={handleCopyLink}
          aria-label="Copy link"
        >
          <FaLink />
          <span>Copy Link</span>
        </button>
      </div>

      {showSuccess && (
        <div className="success-message" role="alert">
          <FaCheck />
          <span>Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
};

export default SocialSharing;