const fs = require("node:fs").promises;
const free_google_translator_api = require("./free_google_translator_api");

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

async function createUsername(name) {
  let firstName = name.first;
  let lastName = name.last;
  let username = "";

  // Check if we have non-English names
  if (!isValidEnglishName(firstName) && !isValidEnglishName(lastName)) {
    // Both first and last names are non-English, generate random English string
    const translatedFirstName = (
      await free_google_translator_api(firstName, "auto", "en")
    ).replace(/\s/g, "");
    const translatedLastName = (
      await free_google_translator_api(lastName, "auto", "en")
    ).replace(/\s/g, "");
    firstName = isValidEnglishName(translatedFirstName)
      ? translatedFirstName.toLowerCase()
      : "";
    lastName = isValidEnglishName(translatedLastName)
      ? translatedLastName.toLowerCase()
      : "";
    if (firstName === "" && lastName === "")
      username = getRandomEnglishString(4, 10);
    else if (firstName === "" || lastName === "")
      username = `${firstName}${lastName}`;
    else {
      if (Math.random() > 0.5) username = `${firstName}${lastName}`;
      else {
        if (Math.random() > 0.5) username = firstName;
        else username = lastName;
      }
    }
  } else {
    firstName = isValidEnglishName(firstName) ? firstName.toLowerCase() : "";
    lastName = isValidEnglishName(lastName) ? lastName.toLowerCase() : "";
    if (firstName === "" || lastName === "")
      username = `${firstName}${lastName}`;
    else {
      if (Math.random() > 0.5) username = `${firstName}${lastName}`;
      else {
        if (Math.random() > 0.5) username = firstName;
        else username = lastName;
      }
    }
  }

  // Append random number with leading zeros
  return `${username}-${getRandomNumberWithLeadingZeros()}`;
}

function createUpdateQuery(email, newName) {
  const escapedEmail = email.replace(/'/g, "''");
  const escapedNewName = newName.replace(/'/g, "''");
  const query = `UPDATE users SET name = '${escapedNewName}' WHERE email = '${escapedEmail}';\n`;
  return query;
}

async function generateQuery(user_profile_file, query_file) {
  try {
    const allUsers = await readJsonFile(user_profile_file);

    const queries = [];
    for (const userData of allUsers) {
      const username = await createUsername(userData.name);
      console.log(userData.email, username);
      queries.push(createUpdateQuery(userData.email, username));
    }
    const combinedQueries = queries.join("\n");

    fs.writeFile(query_file, combinedQueries, (error) => {
      if (error) {
        return console.error(error.message);
      }
    });
  } catch (error) {
    console.error("An error occurred while generating query:", error.message);
    throw error;
  }
}

const USERS_MALE_FILE = "../user-data/users_male.json";
const USERS_FEMALE_FILE = "../user-data/users_female.json";
const USERS_MALE_QUERY_FILE = "../user-data/users_male_update_query.sql";
const USERS_FEMALE_QUERY_FILE = "../user-data/users_female_update_query.sql";

(async () => {
  await generateQuery(USERS_MALE_FILE, USERS_MALE_QUERY_FILE);
  console.log("The query for males is generated.");
  await generateQuery(USERS_FEMALE_FILE, USERS_FEMALE_QUERY_FILE);
  console.log("The query for females is generated.");
  console.log("All query is generated.");
})();
