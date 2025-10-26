import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ .env se key lega
});

const PORT = 5000;

// 🧩 Ecommerce Chatbot API Endpoint
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message || "Hi";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for an eCommerce business.
          You help customers with:
          - Product suggestions
          - Pricing info
          - Shipping details
          - Return policy
          - Ongoing discounts and offers
          - Friendly and professional tone.`,
        },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
