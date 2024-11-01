const fs = require("node:fs");
const readline = require("node:readline");
const axios = require("axios");

// A stream to read the file
const fileStream = fs.createReadStream("geoapify/duplicated_cities.txt");

// Create the readline interface
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Number.POSITIVE_INFINITY,
});

const idsToDelete = []; // To store the IDs of cities to delete

rl.on("line", (line) => {
  // Extract the city IDs and city name from each line
  // Assuming the format is always like {id1,id2,id3} city_name
  const [idPart] = line.split("	"); // Tab character as separator
  const cityIds = idPart.slice(1, -1).split(","); // Remove curly braces and split by comma

  if (cityIds.length > 1) {
    // Add all but the first ID to the list of IDs to delete
    idsToDelete.push(...cityIds.slice(1));
  }
});

rl.on("close", async () => {
  for (const cityId of idsToDelete) {
    await deleteCityById(cityId);
  }
  console.log("All cities have been processed for deletion.");
});

const deleteCityById = async (cityId) => {
  try {
    const response = await axios.delete(
      `https://go.paxintrade.com/api/managebot/removecity/${cityId}`,
    );
    console.log(`City with ID ${cityId} deleted successfully.`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting city with ID ${cityId}:`,
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};
