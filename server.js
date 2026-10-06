const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PAYMENTS_WEBHOOK_URL = process.env.PAYMENTS_WEBHOOK_URL;

app.post("/send", async (req, res) => {
    try {
        const { message, channel } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message cannot be empty."
            });
        }

        let webhookUrl;

        if (channel === "payments") {
            webhookUrl = PAYMENTS_WEBHOOK_URL;
        } else {
            webhookUrl = WEBHOOK_URL;
        }

        if (!webhookUrl) {
            return res.status(500).json({
                success: false,
                error: "Webhook for this channel is not configured."
            });
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: message
            })
        });

        if (!response.ok) {
            return res.status(500).json({
                success: false,
                error: "Discord rejected the webhook."
            });
        }

        res.json({
            success: true,
            message: "Message sent successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to send message."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Webhook sender running on port ${PORT}`);
});
