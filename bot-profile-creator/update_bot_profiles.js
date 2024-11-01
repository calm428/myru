const axios = require("axios");
const maleUsers = require("./user-data/users_male.json");
const femaleUsers = require("./user-data/users_female.json");

async function setProfile(data) {
  try {
    const response = await axios.patch(
      "https://go.paxintrade.com/api/managebot/updateprofile",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Set profile successfully:", data.userId);
    return response.data;
  } catch (error) {
    console.error(
      "Error during set profile for user:",
      data.userId,
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

function getAllProfiles() {
  const users = [
    ...maleUsers.map((user) => ({
      userId: user.userId,
      city: [user.location.city],
      guilds: user.categories,
      hashtags: user.hashtags,
      descr: user.bio,
    })),
    ...femaleUsers.map((user) => ({
      userId: user.userId,
      city: [user.location.city],
      guilds: user.categories,
      hashtags: user.hashtags,
      descr: user.bio,
    })),
  ];

  return users;
}

function getRandomSubList(arr, n) {
  if (arr.length <= n) {
    return [...arr];
  }

  const result = [];
  const indices = new Set();

  while (result.length < n) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      result.push(arr[randomIndex]);
    }
  }

  return result;
}

(async () => {
  const allUsers = getAllProfiles();
  console.log(allUsers.length);
})();
