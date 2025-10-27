import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// ✅ Add webhook route here (AFTER app is defined)
app.post("/webhook/order", express.json(), async (req, res) => {
  try {
    const order = req.body;
    const purchasedTitles = order.line_items.map((item) =>
      item.title.toLowerCase()
    );

    const shopifyRes = await fetch(
      `https://${SHOPIFY_STORE_URL}/admin/api/2025-01/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await shopifyRes.json();
    const allProducts = data.products || [];

    const related = allProducts.filter(
      (p) => !purchasedTitles.includes(p.title.toLowerCase())
    );

    const finalList = related
      .slice(0, 3)
      .map(
        (p) =>
          `🛍️ *${p.title}* — ₹${p.variants[0].price}\n🔗 https://${SHOPIFY_STORE_URL}/products/${p.handle}`
      )
      .join("\n\n");

    console.log("🪄 Cross-sell suggestion ready:\n", finalList);

    res.status(200).send("Webhook received successfully ✅");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).send("Error processing webhook ❌");
  }
});

// ✅ Start server at end
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
