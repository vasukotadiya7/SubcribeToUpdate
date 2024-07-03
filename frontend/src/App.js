// src/App.js
import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_URL}/subscribe`, { email });
      alert("Subscribed successfully!");
    } catch (error) {
      console.error("There was an error subscribing!", error);
    }
  };

  const handleSendUpdates = async (e) => {
    e.preventDefault();
    const SECRET = prompt("Enter Admin Secret : ");
    if (SECRET === process.env.REACT_APP_CODE) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_URL}/send-updates`,
          {
            message,
          }
        );
        alert("Updates sent successfully!");
      } catch (error) {
        console.error("There was an error sending updates!", error);
      }
    } else {
      alert("Invalid Secret");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubscribe}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Subscribe</button>
      </form>

      <form onSubmit={handleSendUpdates}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          required
        />
        <button type="submit">Send Updates</button>
      </form>
    </div>
  );
};

export default App;
