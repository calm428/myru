const axios = require("axios");
const fs = require("node:fs").promises;

const nationEmailDomains = {
  AU: [
    "gmail.com",
    "yahoo.com.au",
    "outlook.com.au",
    "bigpond.com",
    "iinet.net.au",
  ],
  BR: ["gmail.com", "yahoo.com.br", "outlook.com", "bol.com.br", "uol.com.br"],
  CA: ["gmail.com", "yahoo.ca", "outlook.ca", "bell.net", "telus.net"],
  CH: ["gmail.com", "bluewin.ch", "gmx.ch", "hispeed.ch", "outlook.com"],
  DE: ["gmail.com", "web.de", "gmx.de", "t-online.de", "yahoo.de"],
  DK: ["gmail.com", "yahoo.dk", "mail.dk", "live.dk", "outlook.dk"],
  ES: ["gmail.com", "yahoo.es", "hotmail.es", "outlook.es", "terra.es"],
  FI: ["gmail.com", "suomi24.fi", "luukku.com", "elisa.fi", "kolumbus.fi"],
  FR: ["gmail.com", "orange.fr", "free.fr", "sfr.fr", "laposte.net"],
  GB: [
    "gmail.com",
    "yahoo.co.uk",
    "hotmail.co.uk",
    "outlook.co.uk",
    "btinternet.com",
  ],
  IE: ["gmail.com", "eircom.net", "outlook.ie", "yahoo.ie", "hotmail.ie"],
  IN: ["gmail.com", "yahoo.in", "hotmail.com", "rediffmail.com", "outlook.in"],
  IR: ["gmail.com", "yahoo.com", "chmail.ir", "mail.ir", "outlook.com"],
  MX: [
    "gmail.com",
    "yahoo.com.mx",
    "hotmail.com",
    "outlook.com.mx",
    "prodigy.net.mx",
  ],
  NL: ["gmail.com", "ziggo.nl", "kpnmail.nl", "hotmail.nl", "live.nl"],
  NO: ["gmail.com", "yahoo.no", "hotmail.no", "online.no", "outlook.no"],
  NZ: [
    "gmail.com",
    "yahoo.co.nz",
    "xtra.co.nz",
    "outlook.co.nz",
    "vodafone.co.nz",
  ],
  RS: ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "mts.rs"],
  TR: [
    "gmail.com",
    "yahoo.com.tr",
    "hotmail.com",
    "outlook.com.tr",
    "yandex.com.tr",
  ],
  UA: ["gmail.com", "ukr.net", "i.ua", "email.ua", "meta.ua"],
  US: ["gmail.com", "yahoo.com", "outlook.com", "aol.com", "hotmail.com"],
};

function getRandomEmailDomain(countryCode) {
  const domains = nationEmailDomains[countryCode];
  if (domains) {
    const totalWeights = domains.reduce(
      (total, _, index) => total + (domains.length - index),
      0,
    );

    let randomNum = Math.floor(Math.random() * totalWeights) + 1; // range is [1, totalWeights]

    for (let i = 0; i < domains.length; i++) {
      const weight = domains.length - i;
      if (randomNum <= weight) {
        return domains[i];
      }
      randomNum -= weight;
    }
  }
  return "gmail.com";
}

const getUsersWithUpdatedEmails = (users) => {
  return users.map((user) => {
    const newDomain = getRandomEmailDomain(user.nat);
    user.email = `${user.email.split("@")[0]}@${newDomain}`;
    user.picture = undefined;
    user.login = undefined;
    return user;
  });
};

const getMaleUsers = async () => {
  try {
    const endpoint = "https://randomuser.me/api/?results=556&gender=male";
    const response = await axios.get(endpoint);
    const users = getUsersWithUpdatedEmails(response.data.results);

    await fs.writeFile("users_male.json", JSON.stringify(users, null, 2));
    console.log("Users data has been written to users_male.json");
  } catch (error) {
    console.error(
      "There was an error fetching the users:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

const getFemaleUsers = async () => {
  try {
    const endpoint = "https://randomuser.me/api/?results=483&gender=female";
    const response = await axios.get(endpoint);
    const users = getUsersWithUpdatedEmails(response.data.results);

    await fs.writeFile("users_female.json", JSON.stringify(users, null, 2));
    console.log("Users data has been written to users_female.json");
  } catch (error) {
    console.error(
      "There was an error fetching the users:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

getMaleUsers();
getFemaleUsers();
