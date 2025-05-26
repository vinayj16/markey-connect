import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import headerImage from '../assets/your-header-image.jpg';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">MarketConnect</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about" className="active">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <button className="back-btn">Back</button>
      </nav>

      {/* Mission */}
      <section className="section mission-section">
        <h1>Our Mission</h1>
        <p>MarketConnect bridges the gap between vendors and customers, creating a seamless marketplace experience for everyone.</p>
<img src={headerImage} alt="Teamwork" className="header-image" />

      </section>

      {/* Who We Are */}
      <section className="section who-we-are">
        <h2>Who We Are</h2>
        <p>
          Founded in 2023, MarketConnect has grown from a small startup to a leading marketplace platform, focused on building trust and efficiency.
          We’re driven by a mission to help businesses grow and customers find exactly what they need.
        </p>
      </section>

      {/* Our Values */}
      <section className="section values">
        <h2>Our Values</h2>
        <div className="value-grid">
          <div className="value-card">
            <h4>🔹 Innovation</h4>
            <p>Driven by creativity and platform flexibility for both buyers and sellers.</p>
          </div>
          <div className="value-card">
            <h4>🔹 Integrity</h4>
            <p>Building trust through transparent operations.</p>
          </div>
          <div className="value-card">
            <h4>🔹 Community</h4>
            <p>Fostering relationships between businesses and customers.</p>
          </div>
          <div className="value-card">
            <h4>🔹 Excellence</h4>
            <p>Delivering high-quality services and user experiences.</p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section leadership">
        <h2>Leadership Team</h2>
        <ul>
          <li><strong>Sarah Johnson</strong> – Chief Executive Officer</li>
          <li><strong>Michael Chen</strong> – Chief Technology Officer</li>
          <li><strong>Rosa Delgado</strong> – Chief Marketing Officer</li>
        </ul>
      </section>

      {/* Impact */}
      <section className="section impact">
        <h2>Our Impact</h2>
        <img
          src="https://quickchart.io/chart?c={type:'bar',data:{labels:['2019','2020','2021','2022','2023','Present'],datasets:[{label:'Users',data:[20,50,90,130,190,250]}]}}"
          alt="Impact Chart"
        />
        <p className="caption">* MarketConnect user growth per year</p>
      </section>

      {/* CTA */}
      <section className="section join-us">
        <h2>Join Our Journey</h2>
        <p>
          Whether you're a vendor looking to expand your reach or a customer searching for quality products, MarketConnect is here to support your goals.
        </p>
        <div className="btn-group">
          <Link to="/vendor"><button className="btn primary">Join as Vendor</button></Link>
          <Link to="/vendi"><button className="btn secondary">Shop Now</button></Link>
        </div>
        <p>Questions? <Link to="/contact" className="contact-link">Write to us</Link>.</p>
      </section>
    </div>
  );
}

export default AboutUs;
