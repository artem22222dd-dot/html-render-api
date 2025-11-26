const express = require("express");
const bodyParser = require("body-parser");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// Проверка работы сервиса
app.get("/", (req, res) => {
  res.send("HTML Render API работает. Используйте POST /render");
});

// Рендер HTML в PNG
app.post("/render", async (req, res) => {
  const html = req.body.html;
  if (!html) return res.status(400).json({ error: "HTML не передан" });

  try {
    const executablePath = await chromium.executablePath;

    const browser = await puppeteer.launch({
      executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 768, height: 1364 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.screenshot({ type: "png" });

    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);

  } catch (err) {
    console.error("Puppeteer error:", err);
    res.status(500).json({ error: "Ошибка рендера", details: err.toString() });
  }
});

// Используем порт Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Render API started on port ${PORT}`));
