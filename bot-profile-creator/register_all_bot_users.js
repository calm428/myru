const axios = require("axios");
const fs = require("node:fs").promises;

async function readJsonFile(filename) {
  const content = await fs.readFile(filename, "utf8");
  return JSON.parse(content);
}

function getRandomNumberWithLeadingZeros() {
  const randomNum = Math.floor(Math.random() * 9999) + 1;
  return String(randomNum).padStart(4, "0");
}

function getRandomEnglishString(minLength, maxLength) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let randomStr = "";
  for (let i = 0; i < length; i++) {
    randomStr += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return randomStr;
}

function isValidEnglishName(name) {
  return /^[a-zA-Z]+$/.test(name);
}

function createUsername(name) {
  let firstName = name.first;
  let lastName = name.last;
  let username = "";

  // Check if we have non-English names
  if (!isValidEnglishName(firstName) && !isValidEnglishName(lastName)) {
    // Both first and last names are non-English, generate random English string
    username = getRandomEnglishString(4, 10);
  } else {
    // Use the names if they are English, otherwise, use an empty string
    firstName = isValidEnglishName(firstName) ? firstName.toLowerCase() : "";
    lastName = isValidEnglishName(lastName) ? lastName.toLowerCase() : "";

    username = `${firstName}${lastName}`;
  }

  // Append random number with leading zeros
  return `${username}-${getRandomNumberWithLeadingZeros()}`;
}

async function signUpUser(userData) {
  try {
    const response = await axios.post(
      "https://go.paxintrade.com/api/managebot/registerbot",
      {
        email: userData.email,
        name: createUsername(userData.name),
        password: "123123",
        passwordConfirm: "123123",
        DevicesIOS: "",
        DevicesIOSVOIP: "",
      },
    );
    const data = response.data;
    console.log("Signup successfully:", userData.email);
    return {
      email: data.data.user.email,
      user_id: data.data.user.id,
      profile_id: data.data.profile.ID,
    };
  } catch (error) {
    console.error(
      "Error during sign up for user:",
      userData.email,
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

async function processUserSignUps(userProfileFile) {
  try {
    const allUsers = await readJsonFile(userProfileFile);

    const successfulSignUps = [];

    for (const userData of allUsers) {
      try {
        const signUpResult = await signUpUser(userData);
        successfulSignUps.push(signUpResult);
      } catch (error) {
        // Error already logged in signUpUser, so continue to the next user
      }
    }

    // Save successful sign-ups to JSON file
    await fs.writeFile(
      "user-data/users_account-info.json",
      JSON.stringify(successfulSignUps, null, 2),
      "utf8",
    );
    console.log(
      "All user sign-ups processed, results saved to users_account-info.json",
    );
  } catch (error) {
    console.error(
      "An error occurred while processing sign-ups:",
      error.message,
    );
    throw error;
  }
}

const USERS_MALE_FILE = "user-data/users_male.json";
const USERS_FEMALE_FILE = "user-data/users_female.json";

(async () => {
  await processUserSignUps(USERS_MALE_FILE);
  console.log("All male bot users have been added.");
  await processUserSignUps(USERS_FEMALE_FILE);
  console.log("All female bot users have been added.");
  console.log("All bot users have been added.");
})();
