// server.js
const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
// const emailjs = require("@emailjs/browser");
const nodemailer = require("nodemailer");

const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Load service account credentials
// const SERVICE_ACCOUNT_FILE = path.join(__dirname, "service-account.json");
// const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE));
const credentials = JSON.parse(process.env.SERVICE_JSON);

// Google Sheets setup
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

// Spreadsheet ID and range
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = "Sheet1!A:A";

// Subscribe route to save email to Google Sheets
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      resource: {
        values: [[email]],
      },
    });
    res.status(200).send("Subscribed successfully");
  } catch (error) {
    console.error("Error saving email to Google Sheets", error);
    res.status(500).send("Error subscribing");
  }
});

// Email sending route
app.post("/send-updates", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const emails = response.data.values.flat();

    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "VK Technology",
      subject: "New Message from Vasu",
      html: `
          <p>Hello All the Subcribers,</p>
<p>You got a new message from Vasu Kotadiya:</p>
<p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic;">${message}</p>
<p>Best wishes,<br>VK team</p>
        `,
    };

    for (let email of emails) {
      mailOptions.to = email;

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Error sending email to ${email}`, error);
        } else {
          console.log(`Email sent to ${email}: ${info.response}`);
        }
      });
    }

    res.status(200).send("Updates sent successfully");
  } catch (error) {
    console.error("Error sending updates", error);
    res.status(500).send("Error sending updates");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
