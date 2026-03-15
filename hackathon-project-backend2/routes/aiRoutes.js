import express from "express";
import OpenAI from "openai";
import fetch from "node-fetch";
// import { sendPolygonRequestEmail } from "../utils/sendPolyganEmail.js";



const aiRouter = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory storage for last polygon (per server instance)
let lastPolygon = null;

// fallback memory (for when no session)
let globalLastPolygon = null;


//Endpoint to handle user prompts
aiRouter.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("Received prompt:", prompt);
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Fetch all polygons from AgroMonitoring
    const polygonsRes = await fetch(
      `https://api.agromonitoring.com/agro/1.0/polygons?appid=${process.env.AGRO_API_KEY}`
    );

    console.log("polygonsRes", polygonsRes)

    if (!polygonsRes.ok) throw new Error("Failed to fetch polygons from AgroMonitoring");

    const polygons = await polygonsRes.json();

    console.log("Fetched polygons:", polygons);

    // Try to match polygon by name from prompt
    const matchedPolygon = polygons.find((p) =>
      prompt.toLowerCase().includes(p.name.toLowerCase().trim())
    );
    console.log("matchedPolygon", matchedPolygon)
    // Use matched polygon or fallback to last used
    let lastPolygon = matchedPolygon || globalLastPolygon;

    if (!lastPolygon) {
      return res.json({
        reply: `Please include the name of the area where your field is located in your message. 
          If you already did and still see this message, click the map icon beside the ask button and add your area's name so a member of our team can update the data and give you access.`
      });
    }

  
    lastPolygon = matchedPolygon || lastPolygon;
    globalLastPolygon = lastPolygon;

  
    const agroURL = `https://api.agromonitoring.com/agro/1.0/soil?polyid=${lastPolygon.id}&appid=${process.env.AGRO_API_KEY}`;
    const soilRes = await fetch(agroURL);
    console.log("soilRes", soilRes)
    if (!soilRes.ok) throw new Error("Failed to fetch soil data");
    const soilData = await soilRes.json();

const messages = [
  {
    role: "system",
    content:
      "You are an assistant providing practical advice to farmers about plant care, soil conditions, and preventing pests. " +
      "Use the soil data from our system to suggest simple, actionable preventive measures for each possible pest or stress condition. " +
      "Keep the response **short and concise**, around 80-120 words. " +
      "Always respond in simple terms, avoid percentages or technical units, and mention that the soil data is current. " +
      "If the user asks unrelated questions, respond: 'I can only provide advice about plant care and pest prevention based on soil data.'"
  },

  {
    role: "user",
    content: `Soil data from our system for ${lastPolygon.name}: ${JSON.stringify(soilData)}`
  },
  {
    role: "user",
    content: prompt
  }
];
    // Call OpenAI
    const formatted = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages
    });

    const reply = formatted.choices[0].message.content + ` (Area: ${lastPolygon.name})`;

    res.json({ reply, lastPolygonId: lastPolygon.id });
  } catch (err) {
    console.error("Error in /ask route:", err);
    res.status(500).json({ reply: "Unable to process your request right now." });
  }
});


//Endpoint to create a polygon based on area name
aiRouter.post("/create-polygon", async (req, res) => {
  const { area } = req.body;
  if (!area) return res.status(400).json({ error: "Area name is required" });

  try {
    // Prepare messages like in /ask route
    const messages = [
      {
        role: "system",
        content:
          "You are an assistant that only provides a GeoJSON polygon for a town somewhere in the world. " +
          "The polygon must represent an area of approximately 1 hectare at the given location. " +
          "Respond only with a valid GeoJSON object (type: Polygon) that can be directly added to Agromonitoring. " +
          "Do not include any extra text or explanations. Ensure the polygon area is at least 1 hectare."
      },
      {
        role: "user",
        content: `Please provide a polygon for ${area}`
      }
    ];

    // GPT-Nano via fetch → get coordinates
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages
      })
    });

    const ai = await gptRes.json();

    // Safely extract GPT text
    let aiText = "";
    if (ai.choices && ai.choices.length > 0 && ai.choices[0].message) {
      aiText = ai.choices[0].message.content;
    }

    if (!aiText) throw new Error("GPT returned no text output");

    // Parse coordinates JSON
    const match = aiText.match(/\{[^}]+\}/);
    if (!match) throw new Error("No JSON found in GPT output");
    const coords = JSON.parse(match[0]);

    res.json({ status: "success", inputArea: area, aiCoordinates: coords });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate coordinates", details: err.message });
  }
});
 


aiRouter.post("/send-polygon-email", async (req, res) => {
  try {
    await sendPolygonRequestEmail(req, res);
  } catch (error) {
    console.error("Error in route:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});


export { aiRouter };