const fs = require("node:fs");
const axios = require("axios");
const path = require("node:path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

function writeBase64ImageToFile(base64String, outputFile) {
  try {
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
    const binaryData = Buffer.from(base64Data, "base64");
    fs.promises.writeFile(outputFile, binaryData, "binary");
  } catch (error) {
    console.log("Error saving the image:", error.message);
    throw error;
  }
}

module.exports = async function generateImage(prompt, outputFile) {
  const endpoint = `https://api.runpod.ai/v2/${process.env.SD_REALISTIC_VISION_ENDPOINT_ID}/runsync`;

  const config = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: process.env.RUNPOD_API_KEY,
    },
  };

  const data = {
    input: {
      prompt: prompt,
      width: 512,
      height: 512,
      guidance_scale: 7.5,
      num_inference_steps: 50,
      num_outputs: 1,
      prompt_strength: 1,
      scheduler: "KLMS",
    },
  };

  try {
    console.log("\t", "Start image generating ...");
    const response = await axios.post(endpoint, data, config);
    console.log("\t", "Generated image ...");
    await writeBase64ImageToFile(response.data.output[0].image, outputFile);
    console.log("\t", "Image downloaded ...");
    return true;
  } catch (error) {
    console.error(
      "Error:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};
