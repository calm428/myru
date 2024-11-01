const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const axios = require("axios");
const { login } = require("./utils/pax_login");
const translateText = require("./utils/free_google_translator_api");

async function readNdjsonFile(filePath) {
  const citiesList = [];

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Number.POSITIVE_INFINITY,
  });

  for await (const line of rl) {
    try {
      const city = JSON.parse(line);
      const cityEntry = {
        name: city.name || null,
        "name:en": city.other_names?.["name:en"] || null,
        "name:es": city.other_names?.["name:es"] || null,
        "name:ru": city.other_names?.["name:ru"] || null,
        "name:ka": city.other_names?.["name:ka"] || null,
        country_code: city.address?.country_code || "non",
        country: city.address?.country || "No Country",
      };
      if (cityEntry.name !== null) citiesList.push(cityEntry);
    } catch (error) {
      console.error(`Error parsing line in ${filePath}: ${error.message}`);
    }
  }

  return citiesList;
}

async function createCity(hex, countryCode, session, token) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Session: session,
      },
    };

    const res = await axios.post(
      "https://go.myru.online/api/cities/create",
      {
        Hex: hex,
        CountryCode: countryCode,
      },
      config,
    );

    console.log("City created:", res.data.data);
    const cityId = res.data.data.ID;
    return cityId;
  } catch (error) {
    console.error(
      "Error creating city:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
}

async function createCityTranslation(cityId, language, name, session, token) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Session: session,
      },
    };

    const res = await axios.post(
      "https://go.myru.online/api/citiestranslator/create",
      {
        CityID: cityId,
        Language: language,
        Name: name,
      },
      config,
    );

    console.log("City translation created:", res.data.data);
  } catch (error) {
    console.error(
      "Error creating city translation:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
  }
}

async function addCityAndTranslation(
  hex,
  countryCode,
  translationParamsArray,
  session,
  token,
) {
  try {
    const cityId = await createCity(hex, countryCode, session, token);
    if (cityId) {
      for (const translationParams of translationParamsArray) {
        await createCityTranslation(
          cityId,
          translationParams.Language,
          translationParams.Name,
          session,
          token,
        );
      }
    }
  } catch (error) {
    console.error(
      "Error adding city and translation:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
  }
}

async function readCitiesFromFolder(folderPath) {
  let allCities = [];

  const countryDirs = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const country of countryDirs) {
    const ndjsonFilePath = path.join(folderPath, country, "place-city.ndjson");
    if (fs.existsSync(ndjsonFilePath)) {
      const cities = await readNdjsonFile(ndjsonFilePath);
      allCities = allCities.concat(cities);
    }
  }

  return allCities;
}

function hasTranslation(city, translationKey) {
  return city[translationKey] !== undefined && city[translationKey] !== null;
}

async function writeCitiesToFile(cities, folderPath, reportType) {
  let fileName;
  let filteredCities;

  switch (reportType) {
    case "all_translations":
      fileName = "cities_with_all_translations.json";
      filteredCities = cities.filter((city) => {
        return ["name:en", "name:es", "name:ru", "name:ka"].every((key) =>
          hasTranslation(city, key),
        );
      });
      break;
    case "missing_en":
      fileName = "cities_with_missing_en.json";
      filteredCities = cities.filter(
        (city) => !hasTranslation(city, "name:en"),
      );
      break;
    case "missing_other":
      fileName = "cities_with_missing_other.json";
      filteredCities = cities.filter((city) => {
        // Check if English translation exists but other translations are missing
        return (
          hasTranslation(city, "name:en") &&
          ["name:es", "name:ru", "name:ka"].some(
            (key) => !hasTranslation(city, key),
          )
        );
      });
      break;
    default:
      throw new Error(
        "Invalid reportType provided to writeCitiesToFile function",
      );
  }

  // Write the filtered cities to the appropriate file
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(filteredCities, null, 2), "utf8");
}

async function prepareCities(datasetFolder, downloadsFolderPath) {
  try {
    const allCities = await readCitiesFromFolder(downloadsFolderPath);
    await writeCitiesToFile(allCities, datasetFolder, "all_translations");
    await writeCitiesToFile(allCities, datasetFolder, "missing_en");
    await writeCitiesToFile(allCities, datasetFolder, "missing_other");
  } catch (error) {
    console.error("An error occurred while processing cities:", error.message);
  }
}

const updateCityEntryWithTranslations = async (cityEntry) => {
  const sourceLang = cityEntry["name:en"] ? "en" : "auto";
  const sourceText = cityEntry["name:en"] || cityEntry.name;
  const languages = ["es", "ru", "ka", "en"];

  const translationPromises = languages.map((lang) => {
    const langKey = `name:${lang}`;
    if (!cityEntry[langKey]) {
      return translateText(sourceText, sourceLang, lang).then(
        (translatedName) => {
          cityEntry[langKey] = translatedName;
          console.log(
            `Translated city name from ${sourceLang} to ${lang}: ${sourceText} => ${translatedName}`,
          );
        },
      );
    }
    return Promise.resolve();
  });

  await Promise.all(translationPromises);
  return cityEntry;
};

async function addCitiesFromFileToDatabase(filePath, session, token) {
  try {
    const citiesData = fs.readFileSync(filePath, "utf8");
    const cities = JSON.parse(citiesData);

    for (const cityEntry of cities) {
      try {
        const hexColor = "#000000";
        const countryCode = cityEntry.country_code;

        const updatedCity = await updateCityEntryWithTranslations(cityEntry);

        if (
          updatedCity["name:en"] &&
          updatedCity["name:es"] &&
          updatedCity["name:ru"] &&
          updatedCity["name:ka"]
        ) {
          const translationParams = [
            { Language: "original", Name: updatedCity.name },
            { Language: "en", Name: updatedCity["name:en"] },
            { Language: "es", Name: updatedCity["name:es"] },
            { Language: "ru", Name: updatedCity["name:ru"] },
            { Language: "ka", Name: updatedCity["name:ka"] },
          ];

          await addCityAndTranslation(
            hexColor,
            countryCode,
            translationParams,
            session,
            token,
          );
        } else {
          console.log("Failed translation:");
          console.log(cityEntry);
        }
      } catch (error) {
        console.error(
          `Error adding city entry to database: ${
            error.response
              ? error.response.error || error.response.data
              : error.message
          }`,
        );
      }
    }
  } catch (error) {
    console.error(
      `Error reading file or parsing JSON data: ${
        error.response
          ? error.response.error || error.response.data
          : error.message
      }`,
    );
  }
}

prepareCities("geoapify", "geoapify/geoapify_downloads");

(async () => {
  try {
    const { token, session, closeWebSocket } = await login({
      email: "info@ddrw.ru",
      password: "123123123",
    });
    try {
      await addCitiesFromFileToDatabase(
        "geoapify/cities_with_all_translations.json",
        session,
        token,
      );
      await addCitiesFromFileToDatabase(
        "geoapify/cities_with_missing_en.json",
        session,
        token,
      );
      await addCitiesFromFileToDatabase(
        "geoapify/cities_with_missing_other.json",
        session,
        token,
      );
      console.log("All cities have been added.");
    } catch (error) {
      console.error(
        "Error during adding cities:",
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
})();
