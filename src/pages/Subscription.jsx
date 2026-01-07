// src/components/pages/Subscription.jsx
import React, { useState, useEffect } from "react";
import "../styles/Subscription.css";
import { ref, update, get } from "firebase/database";
import { db } from "../firebaseConfig";

import monthlyQR from "../assets/monthly.png";
import yearlyQR from "../assets/yearly.png";

const Subscription = ({ user, onClose }) => {
  const [plan, setPlan] = useState("monthly");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const prices = {
    monthly: 50,
    yearly: 480,
  };

  // 🔥 Check subscription status
  useEffect(() => {
    if (!user) return;

    get(ref(db, `accounts/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.val().subscriptionStatus || null);
      }
    });
  }, [user]);

  const submitPayment = async () => {
    if (!reference.trim()) {
      alert("Please enter the reference number.");
      return;
    }

    setLoading(true);

    await update(ref(db, `accounts/${user.uid}`), {
      isSubscribed: false,
      subscriptionStatus: "pending",
      subscriptionPlan: plan,
      amount: prices[plan],
      referenceNumber: reference.trim(),
      submittedAt: Date.now(),
    });

    setStatus("pending");
    setLoading(false);
  };

  // 🔒 PENDING VIEW
  if (status === "pending") {
    return (
      <div className="subscription-overlay">
        <div className="subscription-modal">
          <h2>Payment Pending ⏳</h2>

          <p className="pending-text">
            Your payment has been submitted and is currently
            <strong> waiting for admin approval</strong>.
          </p>

          <p className="pending-text">
            If this takes too long, you may contact:
          </p>

          <p className="contact-number">📞 09565379494</p>

          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // 💳 NORMAL SUBSCRIPTION VIEW
  return (
    <div className="subscription-overlay">
      <div className="subscription-modal">
        <h2>Choose Your Plan</h2>
        <p>Select a subscription and pay via QR code.</p>

        {/* PLAN SELECT */}
        <div className="subscription-plans">
          <button
            className={`plan-card ${plan === "monthly" ? "active" : ""}`}
            onClick={() => setPlan("monthly")}
          >
            <h3>Monthly</h3>
            <p>₱50 / month</p>
          </button>

          <button
            className={`plan-card ${plan === "yearly" ? "active" : ""}`}
            onClick={() => setPlan("yearly")}
          >
            <h3>Yearly</h3>
            <p>
              ₱480 <span className="discount">20% OFF</span>
            </p>
          </button>
        </div>

        {/* QR CODE */}
        <div className="subscription-qr">
          <img
            src={plan === "monthly" ? monthlyQR : yearlyQR}
            alt="QR Code"
          />
          <p className="qr-note">
            Scan to pay ₱{prices[plan]} ({plan})
          </p>
        </div>

        {/* REFERENCE INPUT */}
        <input
          type="text"
          className="subscription-input"
          placeholder="Enter reference number"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        {/* ACTIONS */}
        <div className="subscription-actions">
          <button
            className="btn-primary"
            onClick={submitPayment}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Payment"}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
