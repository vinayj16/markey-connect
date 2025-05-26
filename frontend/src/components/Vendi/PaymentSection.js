import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import MainLayout from "../layout/MainLayout";
import "./PaymentSection.css";

const PaymentSection = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [promoCode, setPromoCode] = useState("");

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePromoCodeSubmit = (e) => {
    e.preventDefault();
    // Handle promo code application
    console.log("Applying promo code:", promoCode);
  };

  const handleProceedToReview = () => {
    // Validate payment information
    if (paymentMethod === "credit" && !cardInfo.number) {
      alert("Please enter card information");
      return;
    }
    
    // Navigate to review page with payment data
    navigate("/vendi/order-review", {
      state: {
        paymentData: {
          method: paymentMethod,
          cardInfo: paymentMethod === "credit" ? cardInfo : null,
          sameAsShipping,
          promoCode
        }
      }
    });
  };

  const handleBackToShipping = () => {
    navigate("/vendi/checkout", { state: { step: "shipping" } });
  };

  return (
    <MainLayout userType="customer" pageTitle="Payment" showSearchBar={false}>
      <div className={`payment-section ${isDark ? 'dark-theme' : ''}`}>
        <h2>Payment Method</h2>
        <div className="payment-options">
          <label className="payment-option">
            <input 
              type="radio" 
              name="payment" 
              checked={paymentMethod === "credit"}
              onChange={() => handlePaymentMethodChange("credit")}
            />
            <span className="option-label">Credit Card</span>
            <span className="description">Visa, Mastercard, American Express</span>
          </label>
          <label className="payment-option">
            <input 
              type="radio" 
              name="payment"
              checked={paymentMethod === "paypal"}
              onChange={() => handlePaymentMethodChange("paypal")}
            />
            <span className="option-label">PayPal</span>
            <span className="description">Pay with your PayPal account</span>
          </label>
          <label className="payment-option">
            <input 
              type="radio" 
              name="payment"
              checked={paymentMethod === "apple"}
              onChange={() => handlePaymentMethodChange("apple")}
            />
            <span className="option-label">Apple Pay</span>
            <span className="description">Quick checkout with Apple Pay</span>
          </label>
        </div>

        {paymentMethod === "credit" && (
          <>
            <h2>Card Information</h2>
            <div className="card-info">
              <input 
                type="text" 
                name="number"
                placeholder="Card Number" 
                value={cardInfo.number}
                onChange={handleCardInfoChange}
              />
              <input 
                type="text" 
                name="name"
                placeholder="Cardholder Name" 
                value={cardInfo.name}
                onChange={handleCardInfoChange}
              />
              <div className="card-expiry">
                <input 
                  type="text" 
                  name="expiry"
                  placeholder="MM/YY" 
                  value={cardInfo.expiry}
                  onChange={handleCardInfoChange}
                />
                <input 
                  type="text" 
                  name="cvv"
                  placeholder="CVV" 
                  value={cardInfo.cvv}
                  onChange={handleCardInfoChange}
                />
              </div>
            </div>
          </>
        )}

        <h2>Billing Address</h2>
        <div className="billing-address">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
            />
            <span>Same as shipping address</span>
          </label>
          {!sameAsShipping && (
            <div className="billing-form">
              {/* Add billing address form fields here */}
            </div>
          )}
          <p className="address-display">123 Main St, Anytown, US 12345</p>
        </div>

        <h2>Order Summary</h2>
        <div className="order-summary">
          <p className="total-amount"><strong>Order Total: $101.23</strong></p>
          <ul className="summary-details">
            <li>3 items</li>
            <li>Subtotal: $76.24</li>
            <li>Tax: $7.49</li>
            <li>Shipping: $12.50</li>
            <li>Discount: -$5.00</li>
          </ul>
          <div className="summary-buttons">
            <button className="btn-primary" onClick={handleProceedToReview}>
              Proceed to Review
            </button>
            <button className="btn-outline" onClick={handleBackToShipping}>
              Back to Shipping
            </button>
          </div>
        </div>

        <h2>Promotional Code</h2>
        <form className="promo-code" onSubmit={handlePromoCodeSubmit}>
          <input 
            type="text" 
            placeholder="Enter code" 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Apply
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default PaymentSection;
