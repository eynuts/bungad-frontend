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

  // 🔥 Check current subscription status from Firebase
  useEffect(() => {
    if (!user) return;

    get(ref(db, `accounts/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.val().subscriptionStatus || null);
      }
    });
  }, [user]);

  // 🚀 Handle payment submission
  const submitPayment = async () => {
    if (!reference.trim()) {
      alert("Please enter the reference number.");
      return;
    }

    setLoading(true);

    try {
      await update(ref(db, `accounts/${user.uid}`), {
        isSubscribed: false,
        subscriptionStatus: "pending",
        subscriptionPlan: plan,
        amount: prices[plan],
        referenceNumber: reference.trim(),
        submittedAt: Date.now(),
      });

      setStatus("pending");
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sub-overlay">
      <div className={`sub-modal ${status === "pending" ? "compact-view" : "landscape-small"}`}>
        <button className="close-x" onClick={onClose}>
          &times;
        </button>

        {status === "pending" ? (
          /* 🔒 PENDING VIEW: Shows when payment is submitted */
          <div className="pending-container">
            <h3>Payment Pending ⏳</h3>
            <p>Your payment is waiting for admin approval.</p>
            <p className="contact-small">📞 09565379494</p>
            <button className="btn-secondary sm" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          /* 💳 SELECTION VIEW: Normal subscription flow */
          <>
            <div className="sub-header">
              <h2>Subscription</h2>
              <p>Select plan and scan to pay</p>
            </div>

            <div className="sub-content-split">
              {/* LEFT SIDE: SELECTION & INPUT */}
              <div className="sub-left">
                <div className="sub-plans">
                  <div
                    className={`plan-mini ${plan === "monthly" ? "active" : ""}`}
                    onClick={() => setPlan("monthly")}
                  >
                    <strong>Monthly</strong>
                    <span>₱50</span>
                  </div>

                  <div
                    className={`plan-mini ${plan === "yearly" ? "active" : ""}`}
                    onClick={() => setPlan("yearly")}
                  >
                    <strong>Yearly</strong>
                    <span>
                      ₱480 <em className="disc">-20%</em>
                    </span>
                  </div>
                </div>

                <div className="sub-input-group">
                  <input
                    type="text"
                    className="sub-input"
                    placeholder="Reference Number"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                  <div className="sub-actions">
                    <button
                      className="btn-primary sm"
                      onClick={submitPayment}
                      disabled={loading}
                    >
                      {loading ? "..." : "Submit Payment"}
                    </button>
                    <button className="btn-secondary sm" onClick={onClose}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: QR CODE */}
              <div className="sub-right">
                <div className="sub-qr-box">
                  <img
                    src={plan === "monthly" ? monthlyQR : yearlyQR}
                    alt="QR Code"
                  />
                  <p>Pay ₱{prices[plan]}</p>
                  <span className="badge-mini">{plan.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Subscription;
