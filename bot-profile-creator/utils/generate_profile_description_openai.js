const OpenAI = require("openai");
const path = require("node:path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

module.exports = async function generateProfileDescriptions(profile) {
  const model = "gpt-4-turbo-preview";
  const openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
    maxRetries: 0,
  });
  const system_prompt = {
    role: "system",
    content: "You are a helpful social profile writer. Write in informal tone.",
  };

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

    const result1 = await openai.chat.completions.create({
      model: model,
      messages: history,
    });

    history.push(result1.choices[0].message);
    description = result1.choices[0].message.content.trim();

    history.push({
      role: "user",
      content: `This is my personal info:\n${JSON.stringify(
        profile,
        null,
        2,
      )}\n\n\nPlease give me additional info for my social platform profile.\nRandomly select one of my categories and write 5 to 20 sentences.\nTalk about the benefits or interesting stories of activities related to your work.\nWrite in quill editor's HTML format. But don't use header tags such as h1, h2, h3. Use paragraph, string, list, strong, italic, underline, break, and other tags.\nReturn only HTML code, without any additional text.`,
    });

    const result2 = await openai.chat.completions.create({
      model: model,
      messages: history,
    });

    history.push(result2.choices[0].message);
    additionalDescription = result2.choices[0].message.content
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
