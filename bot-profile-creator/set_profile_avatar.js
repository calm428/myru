const axios = require("axios");
const fs = require("node:fs");
const FormData = require("form-data");
const { login } = require("./utils/pax_login");

async function readJsonFile(filename) {
  const content = await fs.promises.readFile(filename, "utf8");
  return JSON.parse(content);
}

const updateProfilePhotos = async (photoPath, session, token) => {
  try {
    const requestData = [{ path: photoPath }];
    const headers = {
      Authorization: `Bearer ${token}`,
      Session: session,
      "Content-Type": "application/json",
    };
    const response = await axios.patch(
      "https://go.paxintrade.com/api/profile/photos",
      requestData,
      {
        headers: headers,
      },
    );
  } catch (error) {
    console.error(
      "Error updating profile photos:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

const uploadFileAndUpdateProfile = async (file_path, session, token) => {
  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(file_path));
    const formHeaders = formData.getHeaders();
    const uploadResponse = await axios.post(
      "https://go.paxintrade.com/api/files/upload/images",
      formData,
      {
        headers: {
          ...formHeaders,
          Authorization: `Bearer ${token}`,
          Session: session,
        },
      },
    );
    const photoPath = uploadResponse.data.files[0].path;
    await updateProfilePhotos(photoPath, session, token);
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

async function authenticateAndUpload(email, file_path) {
  try {
    const { token, session, closeWebSocket } = await login({
      email: email,
      password: "123123",
    });
    try {
      await uploadFileAndUpdateProfile(file_path, session, token);
      console.log("Profile photos updated successfully:", email, file_path);
    } catch (error) {
      console.error(
        "Error during photo upload:",
        error.response
          ? error.response.error || error.response.data
          : error.message,
      );
      throw error;
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

const MALE_USER_FILE_PATH = "user-data/users_male.json";
const FEMALE_USER_FILE_PATH = "user-data/users_female.json";
const PHOTO_INFO_FILE_PATH = "photos/results.json";
const BASE_PHOTO_FILES_PATH = "photos/assets";

(async () => {
  const photo_info = await readJsonFile(PHOTO_INFO_FILE_PATH);
  const male_users = (await readJsonFile(MALE_USER_FILE_PATH)).map(
    (user, index) => ({
      email: user.email,
      photo_path: photo_info.men_images[index],
    }),
  );
  const female_users = (await readJsonFile(FEMALE_USER_FILE_PATH)).map(
    (user, index) => ({
      email: user.email,
      photo_path: photo_info.women_images[index],
    }),
  );
  const users = [...male_users, ...female_users];
  for (const user of users) {
    await authenticateAndUpload(
      user.email,
      `${BASE_PHOTO_FILES_PATH}/${user.photo_path}`,
    );
  }
  console.log("Set all profile photos.");
})();
