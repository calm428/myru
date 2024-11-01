const axios = require("axios");
const fs = require("node:fs").promises;
const generateProfileDescriptions = require("./utils/generate_profile_description_openai");

async function getLocalUserProfiles(local_file_path) {
  try {
    const data = await fs.readFile(local_file_path, "utf-8");
    const profiles = JSON.parse(data);
    return profiles.map((input) => ({
      userId: input.userId,
      profile: {
        gender: input.gender,
        name: input.name,
        location: {
          city: input.location.city.name,
          country: input.location.country,
        },
        email: input.email,
        cellphone: input.cellphone,
        telephone: input.telephone,
        dob: input.dob,
        nat: input.nat,
        categories: input.categories.map((category) => category.name),
        hashtags: input.hashtags.map((hashtag) => hashtag.name),
      },
      cityIds: [
        {
          id: input.location.city.id,
        },
      ],
      categoryIds: input.categories.map((category) => ({ id: category.id })),
      hashtagIds: input.hashtags.map((hashtag) => ({ id: hashtag.id })),
    }));
  } catch (error) {
    console.error("Error while reading local user profiles:", error.message);
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

async function setProfileAdditional(data) {
  try {
    const response = await axios.patch(
      "https://go.paxintrade.com/api/managebot/updateadditionalinfo",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Set profile additional info successfully:", data.userId);
    return response.data;
  } catch (error) {
    console.error(
      "Error during set profile additional info for user:",
      data.userId,
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

const MALE_USER_FILE_PATH = "user-data/users_male.json";
const FEMALE_USER_FILE_PATH = "user-data/users_female.json";

(async () => {
  const maleUsers = await getLocalUserProfiles(MALE_USER_FILE_PATH);
  const femaleUsers = await getLocalUserProfiles(FEMALE_USER_FILE_PATH);
  for (const user of [...maleUsers, ...femaleUsers]) {
    let result = false;
    while (!result) {
      try {
        const { description, additionalDescription } =
          await generateProfileDescriptions(user.profile);
        console.log(user)
        await setProfile({
          userId: user.userId,
          firstName: user.profile.name.first,
          city: user.cityIds,
          guilds: user.categoryIds,
          hashtags: user.hashtagIds,
          descr:
            description[0] === '"' ? description.slice(1, -1) : description,
        });
        await setProfileAdditional({
          userId: user.userId,
          additional: additionalDescription,
        });
        result = true;
      } catch (error) {
        console.error(
          "Error during get and set profile description and additional info for user:",
          error.response
            ? error.response.error || error.response.data
            : error.message,
          "Trying again ...",
        );
      }
    }
  }
  console.log("Set all profile description and additional info.");
})();
