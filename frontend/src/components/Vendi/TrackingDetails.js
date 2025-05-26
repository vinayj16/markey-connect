import React, { useState, useEffect } from 'react';
import { FaTruck, FaMapMarkerAlt, FaClock, FaBox, FaUser, FaHome, FaCog } from 'react-icons/fa';
import './TrackingDetails.css';

const TrackingDetails = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const trackingDetails = {
    id: 'MC-2023-45678',
    date: 'Nov 16, 2023',
    time: '10:20 AM',
    status: 'In Transit',
    estimatedDelivery: 'Nov 18, 2023',
    detailedTracking: [
      { 
        event: 'Package Picked Up', 
        date: 'Nov 15, 2023', 
        time: '2:45 PM', 
        location: 'New York, NY',
        icon: <FaBox />
      },
      { 
        event: 'Arrived at Sorting Facility', 
        date: 'Nov 15, 2023', 
        time: '3:30 PM', 
        location: 'Newark, NJ',
        icon: <FaCog />
      },
      { 
        event: 'Departed Facility', 
        date: 'Nov 15, 2023', 
        time: '4:15 PM', 
        location: 'Newark, NJ',
        icon: <FaTruck />
      },
      { 
        event: 'In Transit', 
        date: 'Nov 16, 2023', 
        time: '10:20 AM', 
        location: 'Somewhere over the Atlantic',
        icon: <FaTruck />
      },
      { 
        event: 'Arrived at Distribution Hub', 
        date: 'Nov 16, 2023', 
        time: '11:45 AM', 
        location: 'London, UK',
        icon: <FaCog />
      },
      { 
        event: 'Out for Delivery', 
        date: 'Nov 16, 2023', 
        time: '1:30 PM', 
        location: 'London, UK',
        icon: <FaTruck />
      },
      { 
        event: 'Delivered', 
        date: 'Nov 16, 2023', 
        time: '2:15 PM', 
        location: 'London, UK',
        icon: <FaBox />
      },
    ],
    shipmentInfo: {
      serviceType: 'Standard Delivery',
      weight: '2.5 kg',
      dimensions: '12" x 8" x 4"',
      shipDate: 'Nov 15, 2023',
      recipient: 'John Doe',
      address: '123 Main Street, Apt 4B, New York, NY 10001',
    },
    deliveryOptions: [
      { 
        option: 'Delay Delivery', 
        description: 'Reschedule delivery for a later date.',
        icon: <FaClock />
      },
      { 
        option: 'Signature Required', 
        description: 'Ensure someone is available to sign for the package.',
        icon: <FaUser />
      },
      { 
        option: 'Leave at Door', 
        description: 'Allow the package to be left at the door if no one is available.',
        icon: <FaHome />
      },
    ],
    packageTravelMap: 'path-to-map-image.jpg', // Replace with actual image path
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'delivered';
      case 'in transit':
        return 'in-transit';
      case 'delayed':
        return 'delayed';
      default:
        return '';
    }
  };

  return (
    <div className="tracking-details-container">
      <h1>Tracking Details</h1>

      <div className="tracking-header">
        <p><strong>Tracking ID:</strong> {trackingDetails.id}</p>
        <p><strong>Last Updated:</strong> {trackingDetails.date} - {trackingDetails.time}</p>
      </div>

      <div className="shipment-status">
        <h2>Shipment Status</h2>
        <div className={`status-indicator ${getStatusClass(trackingDetails.status)}`}>
          {trackingDetails.status}
        </div>
        <p><strong>Estimated Delivery:</strong> {trackingDetails.estimatedDelivery}</p>
      </div>

      <div className="detailed-tracking">
        <h2>Detailed Tracking</h2>
        <ul>
          {trackingDetails.detailedTracking.map((event, index) => (
            <li key={index}>
              <div className="event-info">
                <span className="event-icon">{event.icon}</span>
                <strong>{event.event}</strong>
              </div>
              <div className="event-details">
                <span>{event.date} {event.time}</span>
                <span className="event-location">
                  <FaMapMarkerAlt /> {event.location}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="shipment-info">
        <h2>Shipment Information</h2>
        <p>
          <strong>Service Type:</strong>
          <span>{trackingDetails.shipmentInfo.serviceType}</span>
        </p>
        <p>
          <strong>Weight:</strong>
          <span>{trackingDetails.shipmentInfo.weight}</span>
        </p>
        <p>
          <strong>Dimensions:</strong>
          <span>{trackingDetails.shipmentInfo.dimensions}</span>
        </p>
        <p>
          <strong>Ship Date:</strong>
          <span>{trackingDetails.shipmentInfo.shipDate}</span>
        </p>
        <p>
          <strong>Recipient:</strong>
          <span>{trackingDetails.shipmentInfo.recipient}</span>
        </p>
        <p>
          <strong>Address:</strong>
          <span>{trackingDetails.shipmentInfo.address}</span>
        </p>
      </div>

      <div className="delivery-options">
        <h2>Delivery Options</h2>
        <ul>
          {trackingDetails.deliveryOptions.map((option, index) => (
            <li key={index}>
              <div className="option-info">
                <span className="option-icon">{option.icon}</span>
                <strong>{option.option}</strong>
              </div>
              <span className="option-description">{option.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="package-travel-map">
        <h2>Package Travel Map</h2>
        <img 
          src={trackingDetails.packageTravelMap} 
          alt="Package Travel Map" 
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default TrackingDetails;
