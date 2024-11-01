const fs = require("node:fs");
const csv = require("csv-parser");
const axios = require("axios");

async function readJsonFile(filename) {
  const content = await fs.promises.readFile(filename, "utf8");
  return JSON.parse(content);
}

async function readCsvFile(csvFilePath, handleData) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", handleData)
      .on("end", resolve)
      .on("error", reject);
  });
}

async function getCityIdMapping(csvFilePath) {
  const cityIdMapping = new Map();
  await readCsvFile(csvFilePath, (data) => {
    if (!cityIdMapping.has(data.name)) {
      cityIdMapping.set(data.name, data.city_id);
    }
  });
  return cityIdMapping;
}

async function readCitiesAndGetCountryToCityIdsMapping(citiesFilePath) {
  const countryToCityIdsMapping = new Map();

  await readCsvFile(citiesFilePath, (data) => {
    const countryCode = data.country_code.toLowerCase();
    const cityId = data.id;
    if (!countryToCityIdsMapping.has(countryCode)) {
      countryToCityIdsMapping.set(countryCode, []);
    }
    countryToCityIdsMapping.get(countryCode).push(cityId);
  });
  return countryToCityIdsMapping;
}

function getRandomCityIdFromSameCountry(countryCode, countryToCityIdsMapping) {
  const cityIds = countryToCityIdsMapping.get(countryCode.toLowerCase());
  if (!cityIds || cityIds.length === 0) {
    throw new Error(`No cities found for country code: ${countryCode}`);
  }

  const randomIndex = Math.floor(Math.random() * cityIds.length);
  return cityIds[randomIndex];
}

function getRandomArray(min, max, count) {
  const availableValues = [];
  for (let i = min; i <= max; i++) {
    availableValues.push(i);
  }

  const selectedValues = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableValues.length);
    selectedValues.push(availableValues.splice(randomIndex, 1)[0]);
  }

  return selectedValues;
}

function getRandomGuilds() {
  const numberOfGuilds = Math.floor(Math.random() * 3) + 1;
  return getRandomArray(13, 34, numberOfGuilds);
}

function getRandomHashtags() {
  const numberOfHashtags = Math.floor(Math.random() * 5) + 2;
  return getRandomArray(204, 3234, numberOfHashtags);
}

async function prepareProfiles(
  userListFile,
  userIdListFile,
  cityInfoFile,
  cityIdListFile,
) {
  try {
    const users = await readJsonFile(userListFile);
    const userIds = await readJsonFile(userIdListFile);
    const cityIdMapping = await getCityIdMapping(cityInfoFile);
    const userIdAndCityIdMappings = [];

    for (const user of users) {
      const userCityName = user.location.city;
      const userId = userIds.find((u) => u.email === user.email).user_id;
      const cityId = cityIdMapping.get(userCityName);

      if (!cityId) {
        const randomCityId = getRandomCityIdFromSameCountry(
          user.nat.toLowerCase(),
          await readCitiesAndGetCountryToCityIdsMapping(cityIdListFile),
        );
        if (randomCityId) {
          userIdAndCityIdMappings.push({
            userId: userId,
            city: [{ id: Number.parseInt(randomCityId) }],
            guilds: getRandomGuilds().map((guild) => ({ id: guild })),
            hashtags: getRandomHashtags().map((tag) => ({ id: tag })),
          });
        } else {
          console.log(`No city ID found for ${userCityName}`);
          console.log(user.location);
        }
      } else {
        userIdAndCityIdMappings.push({
          userId: userId,
          city: [{ id: Number.parseInt(cityId) }],
          guilds: getRandomGuilds().map((guild) => ({ id: guild })),
          hashtags: getRandomHashtags().map((tag) => ({ id: tag })),
        });
      }
    }
    return userIdAndCityIdMappings;
  } catch (error) {
    console.error(
      "An error occurred while processing set profile:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

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

const USERS_ID_LIST_FILE = "user-data/users_account-info.json";
const USERS_MALE_FILE = "user-data/users_male.json";
const USERS_FEMALE_FILE = "user-data/users_female.json";
const CITY_TRANSLATIONS_CSV_FILE = "geoapify/city_translations.csv";
const CITIES_CSV_FILE = "geoapify/cities.csv";

(async () => {
  const maleProfiles = await prepareProfiles(
    USERS_MALE_FILE,
    USERS_ID_LIST_FILE,
    CITY_TRANSLATIONS_CSV_FILE,
    CITIES_CSV_FILE,
  );
  for (const user of maleProfiles) {
    await setProfile(user);
  }
  console.log("All male bot users' profiles have been set.");
  const femaleProfiles = await prepareProfiles(
    USERS_FEMALE_FILE,
    USERS_ID_LIST_FILE,
    CITY_TRANSLATIONS_CSV_FILE,
    CITIES_CSV_FILE,
  );
  for (const user of femaleProfiles) {
    await setProfile(user);
  }
  console.log("All female bot users' profiles have been set.");
  console.log("All bot users' profiles have been set.");
})();
