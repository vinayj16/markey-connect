import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TicketSuccess.css';

function TicketSuccess() {
  const navigate = useNavigate();

  // Static sample data — replace with real values using props or context
  const referenceNumber = 'MKT-2023-78945';
  const subject = 'Product Inquiry';
  const submittedTime = 'Oct 15, 2023 at 2:45 PM';

  return (
    <div className="ticket-success-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">MarketConnect</div>
        <ul className="nav-links">
          <li>🏠 Home</li>
          <li>ℹ️ About</li>
          <li>📧 Contact</li>
        </ul>
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
      </nav>

      {/* Confirmation Box */}
      <div className="confirmation-box">
        <h3>✅ Message Sent Successfully</h3>
        <p>
          Thank you for contacting MarketConnect. We’ve received your message and will respond within 24 hours.
        </p>
        <div className="confirmation-buttons">
          <button onClick={() => navigate('/')}>Return to Home</button>
          <button onClick={() => navigate('/submit-ticket')}>Send Another Message</button>
        </div>
      </div>

      {/* Message Details */}
      <div className="message-details">
        <h4>Message Details</h4>
        <ul>
          <li>
            <span>📎 Reference Number</span>
            <strong>{referenceNumber}</strong>
          </li>
          <li>
            <span>📝 Subject</span>
            <strong>{subject}</strong>
          </li>
          <li>
            <span>📅 Submitted</span>
            <strong>{submittedTime}</strong>
          </li>
        </ul>
      </div>

      {/* What's Next */}
      <div className="next-steps">
        <h4>What’s Next?</h4>
        <ul>
          <li>
            <span>📧 Check your email</span>
            <span>We’ve sent a copy of your message to your email address</span>
          </li>
          <li>
            <span>👨‍💻 Support team review</span>
            <span>Our team will review your message and prepare a response</span>
          </li>
          <li>
            <span>⏳ Response within 24 hours</span>
            <span>You’ll receive a response via email within one business day</span>
          </li>
        </ul>
      </div>

      {/* Support Section */}
      <div className="support-help">
        <p>Need Immediate Assistance?</p>
        <button className="call-btn">Call Support</button>
        <button className="faq-btn">View FAQ</button>
      </div>
    </div>
  );
}

export default TicketSuccess;
