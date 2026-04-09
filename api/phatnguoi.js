import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { licensePlate } = req.query;

  if (!licensePlate) {
    return res.status(400).json({ error: "Missing licensePlate" });
  }

  try {
    const url = `https://www.csgt.vn/tra-cuu-phuong-tien-vi-pham.html?bs=${licensePlate}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "vi-VN,vi;q=0.9",
        Referer: "https://www.csgt.vn/",
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let result = [];

    $("table tbody tr").each((i, el) => {
      const cols = $(el).find("td");

      if (cols.length >= 3) {
        result.push({
          time: $(cols[0]).text().trim(),
          location: $(cols[1]).text().trim(),
          violation: $(cols[2]).text().trim(),
        });
      }
    });

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Fetch failed",
      detail: err.message,
    });
  }
}