import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
app.use(cors());

app.get("/api", async (req, res) => {
    const plate = req.query.licensePlate;

    if (!plate) {
        return res.json({ error: "Missing licensePlate" });
    }

    try {
        const url = `https://www.csgt.vn/tra-cuu-phuong-tien-vi-pham.html?bs=${plate}`;

        const response = await axios.get(url);
        const html = response.data;

        const $ = cheerio.load(html);

        let result = [];

        $("table tbody tr").each((i, el) => {
            const cols = $(el).find("td");

            if (cols.length >= 3) {
                result.push({
                    time: $(cols[0]).text().trim(),
                    location: $(cols[1]).text().trim(),
                    violation: $(cols[2]).text().trim()
                });
            }
        });

        res.json(result);

    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

app.get("/", (req, res) => {
    res.send("API running");
});

app.listen(process.env.PORT || 3000);