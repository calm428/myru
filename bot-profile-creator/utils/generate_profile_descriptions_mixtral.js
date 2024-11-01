const axios = require("axios");
const path = require("node:path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

module.exports = async function generateProfileDescriptions(profile) {
  const model = "mixtral";
  const system_prompt = {
    role: "system",
    content: "You are a helpful social profile writer. Write in informal tone.",
  };
  const endpoint = new URL("/api/chat", process.env.MIXTRAL_SERVER).href;

  const history = [system_prompt];
  let description;
  let additionalDescription;

  try {
    history.push({
      role: "user",
      content: `This is my personal info:\n${JSON.stringify(
        {
          gender: profile.gender,
          name: profile.name,
          location: profile.location,
          nat: profile.nat,
          categories: profile.categories,
        },
        null,
        2,
      )}\n\n\nPlease give me a profile description to use on the social platform.\nKeep it professional, simple, fun, and varied.\nCreate it by using some information such as my categories.\nWrite within 1~2 sentences.\nRef following style: I'm into technology! I will be glad to meet new people.`,
    });

    const res1 = await axios.post(endpoint, {
      model: model,
      messages: history,
      stream: false,
    });

    history.push(res1.data.message);
    description = res1.data.message.content.trim();

    history.push({
      role: "user",
      content: `This is my personal info:\n${JSON.stringify(
        profile,
        null,
        2,
      )}\n\n\nPlease give me additional info for my social platform profile.\nRandomly select one of my categories and write 5 to 20 sentences.\nTalk about the benefits or interesting stories of activities related to your work.\nWrite in quill editor's HTML format. But don't use header tags such as h1, h2, h3. Use paragraph, string, list, strong, italic, underline, break, and other tags.\nReturn only HTML code, without any additional text.`,
    });

    const res2 = await axios.post(endpoint, {
      model: model,
      messages: history,
      stream: false,
    });

    history.push(res2.data.message);
    additionalDescription = res2.data.message.content
      .replace(/^```html\n?|\n?```$/g, "")
      .replace(/^```\n?|\n?```$/g, "")
      .trim();
  } catch (error) {
    console.error(
      "Error during get profile description and additional info for user:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
  return { description, additionalDescription };
};
