const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/render", async (req, res) => {
  const html = req.body.html;
  if (!html) return res.status(400).json({ error: "HTML не передан" });

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 768, height: 1344 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    const buffer = await page.screenshot({ type: "png" });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка рендера" });
  }
});

app.listen(3000, () => console.log("Render API started on port 3000"));
