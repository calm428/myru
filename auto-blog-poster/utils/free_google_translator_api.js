const axios = require("axios");
const querystring = require("querystring");

module.exports = async (source, sourceLang, targetLang) => {
  try {
    const encodedSource = querystring.escape(source);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedSource}`;

    const response = await axios.get(url);
    const translations = response.data[0];

    let translatedText = "";
    // biome-ignore lint/complexity/noForEach: <explanation>
    translations.forEach((translation) => {
      translatedText += translation[0];
    });

    return translatedText;
  } catch (error) {
    console.error(
      "Error translating text:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};
