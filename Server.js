
const express = require("express");
const app = express();

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("JARVIS AI backend is online.");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000
    ) {
      return res.status(400).json({
        error: "Enter a message under 2000 characters."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI API key is not configured."
      });
    }

    const ai = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions: "You are JARVIS, a helpful personal AI assistant.",
          input: message,
          max_output_tokens: 400
        })
      }
    );

    const data = await ai.json();

    if (!ai.ok) {
      return res.status(502).json({
        error: "The AI service request failed. Check your API access and billing."
      });
    }

    const reply = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    res.json({
      reply: reply || "Sorry, I couldn't generate a response."
    });
  } catch {
    res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS backend running on port ${port}`);
});
