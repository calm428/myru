const axios = require("axios");
const path = require("node:path");
const fs = require("node:fs");
const { login } = require("./utils/pax_login");

async function postHashtag(hashtag, session, token) {
  const data = { Hashtag: hashtag };
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Session: session,
    },
  };

  try {
    const response = await axios.post(
      "https://go.paxintrade.com/api/profilehashtags/addhashtag",
      data,
      config,
    );
    console.log("Data posted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error posting data:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

async function add_hashtags(hashtags) {
  try {
    const { token, session, closeWebSocket } = await login({
      email: "a.leonov@paxintrade.com",
      password: "123123",
    });
    try {
      for (const tag of hashtags) {
        await postHashtag(tag.slice(1), session, token);
      }
      console.log("All hashtags have been added.");
    } catch (error) {
      console.error(
        "Error during adding hashtags:",
        error.response
          ? error.response.error || error.response.data
          : error.message,
      );
    } finally {
      closeWebSocket();
    }
  } catch (error) {
    console.error(
      "Error during login:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

// add_hashtags();
const FILE_PATH = path.join("user-data", "profile-hashtags.txt");
fs.readFile(FILE_PATH, "utf8", (error, data) => {
  if (error) {
    console.error("Error reading the file:", error.message);
    return;
  }

  const lines = data.split("\n").map((line) => line.trim());
  add_hashtags(lines);
});
