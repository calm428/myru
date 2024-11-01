const axios = require("axios");
const fs = require("node:fs").promises;

async function fetchApiUserProfiles() {
  try {
    // Fetch user profiles from the API
    const response = await axios.get(
      "https://go.paxintrade.com/api/profiles/get?limit=10000&language=en",
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "Error while fetching user profiles from the API:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

async function getLocalUserProfiles(local_file_path) {
  try {
    // Read the local user profiles JSON file
    const data = await fs.readFile(local_file_path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Error while reading local user profiles:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function updateDobIfOlderThan60(dobString) {
  const age = calculateAge(dobString);
  if (age > 60) {
    const currentYear = new Date().getFullYear();
    // Generate a random year between currentYear - 40 and currentYear - 20
    const randomYear =
      Math.floor(Math.random() * (40 - 20 + 1)) + currentYear - 40;
    // Preserve the original month and day
    const originalDob = new Date(dobString);
    const newDob = new Date(originalDob);
    newDob.setFullYear(randomYear);
    return newDob.toISOString();
  }
  return dobString; // If age is not greater than 60, return the original DOB
}

async function mergeApiDataToLocalUsers(local_file_path) {
  try {
    // Get user profiles from the API and the local JSON file
    const apiUserProfiles = await fetchApiUserProfiles();
    const localUserProfiles = await getLocalUserProfiles(local_file_path);

    // Create a map for quick access to API users data by their email
    const apiUserProfilesByEmail = new Map(
      apiUserProfiles.map((profile) => [profile.User.Email, profile]),
    );

    // Merge the API data with local users data
    const mergedUserProfiles = localUserProfiles.map((localProfile) => {
      const apiProfile = apiUserProfilesByEmail.get(localProfile.email);
      const profileClone = { ...localProfile };
      if (apiProfile) {
        return {
          userId: apiProfile.UserID,
          gender: profileClone.gender,
          name: profileClone.name,
          location: {
            city: apiProfile.City.map((city) => ({
              id: city.ID,
              name: city.Translations[0].Name,
            }))[0],
            country: profileClone.location.country,
          },
          email: profileClone.email,
          cellphone: replaceAlphaWithRandomNumber(profileClone.cell),
          telephone: replaceAlphaWithRandomNumber(profileClone.phone),
          dob: updateDobIfOlderThan60(profileClone.dob.date),
          nat: profileClone.nat,
          identity: profileClone.id,
          categories: apiProfile.Guilds.map((guild) => ({
            id: guild.ID,
            name: guild.Translations[0].Name,
          })),
          hashtags: apiProfile.Hashtags.map((hashtag) => ({
            id: hashtag.ID,
            name: hashtag.Hashtag,
          })),
        };
      }
      return profileClone;
    });

    return mergedUserProfiles;
  } catch (error) {
    console.error(
      "Error while merging API data to local users:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

function replaceAlphaWithRandomNumber(str) {
  return str.replace(/[A-Za-z]/g, () => Math.floor(Math.random() * 10));
}

const MALE_USER_FILE_PATH = "../user-data/users_male.json";
const FEMALE_USER_FILE_PATH = "../user-data/users_female.json";
const NEW_MALE_USER_FILE_PATH = "../user-data/users_male_updated.json";
const NEW_FEMALE_USER_FILE_PATH = "../user-data/users_female_updated.json";

(async () => {
  const maleUsers = await mergeApiDataToLocalUsers(MALE_USER_FILE_PATH);
  await fs.writeFile(
    NEW_MALE_USER_FILE_PATH,
    JSON.stringify(maleUsers, null, 2),
  );
  const femaleUsers = await mergeApiDataToLocalUsers(FEMALE_USER_FILE_PATH);
  await fs.writeFile(
    NEW_FEMALE_USER_FILE_PATH,
    JSON.stringify(femaleUsers, null, 2),
  );
})();
