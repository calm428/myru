const axios = require("axios");
const path = require("node:path");
const { extractJSON, extractHTML } = require("./utils");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

module.exports = async function generateArticle(
  articleInfo,
  email = "test@test.me",
) {
  const model = process.env.LLM_MODEL;
  const system_prompt = {
    role: "system",
    content: "You are a helpful social blog writer. Write in informal tone.",
  };
  const endpoint = `https://${process.env.LLM_POD_ID}-11434.proxy.runpod.net/api/chat`;
  // const endpoint = `https://api.runpod.ai/v2/${process.env.LLM_ENDPOINT_ID}/runsync`;

  const config = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      // authorization: process.env.RUNPOD_API_KEY,
    },
  };

  const history = [system_prompt];

  try {
    if (Math.random() > 0.5) articleInfo.userProfile.name = undefined;

    console.log("Start generating ...", `(${email})`);
    history.push({
      role: "user",
      content: `
        This is my personal info:\n
        ${JSON.stringify(articleInfo.userProfile, null, 2)}
        \n\n\n
        I want post about ${articleInfo.category}.\n
        Please give me a blog title, subtitle, slug, 2~5 hashtags to post on social platform.\n
        I have to parse using JSON in js code. So return with following json format with markdown json block: \`\`\`json + \`\`\`.\n
        ${JSON.stringify(
          {
            title: "TITLE",
            subtitle: "SUBTITLE",
            slug: "SLUG",
            hashtags: ["HASHTAG1", "HASHTAG2"],
          },
          null,
          2,
        )}
        \nIt must be returned in the JSON format above, contain all required metadata, and output only a JSON. Do not print additional information such as descriptions.
        \n\n\n
        The title should represent the basic content of the blog, and the subtitle may include a brief description or other information. Also, the slug is for a URL and should not contain any spaces or capital letters.
        `,
    });
    let metadataResponse;
    while (true) {
      const result1 = await axios.post(
        endpoint,
        {
          model: model,
          messages: history,
          keep_alive: "24h",
          stream: false,
        },
        config,
      );
      const { title, subtitle, slug, hashtags } = extractJSON(
        result1.data.message.content.replace(/```\n```/g, "```"),
        "object",
      );
      metadataResponse = result1;
      if (title && subtitle && slug && hashtags) break;
    }
    console.log("\t", "Generated metadata ...");
    history.push(metadataResponse.data.message);
    const { title, subtitle, slug, hashtags } = extractJSON(
      metadataResponse.data.message.content.replace(/```\n```/g, "```"),
      "object",
    );
    console.log("\t", "Parsed metadata ...");

    history.push({
      role: "user",
      content: `
        Please give me content of blog.\n
        Write professionally yet interestingly.\n
        Write in quill editor's HTML format with markdown html block: \`\`\`html + \`\`\`. But don't use header tags such as h1, h2, h3. Use paragraph, string, list, strong, italic, underline, break, and other tags.\n
        Return only HTML code, without any additional text.
      `,
    });
    const result2 = await axios.post(
      endpoint,
      {
        model: model,
        messages: history,
        keep_alive: "24h",
        stream: false,
      },
      config,
    );
    console.log("\t", "Generated content ...");
    history.push(result2.data.message);
    const content = extractHTML(result2.data.message.content);
    const originalContent = result2.data.message.content;
    console.log("\t", "Parsed content ...");

    // work room portrait
    const imagePrompt1 = `
      I am trying to create realistic photo.\n
      Create vivid photos that show where I work.\n
      If possible, focus on the background and avoid creating people as much as possible.
    `;
    // anima or fairytale portrait
    const imagePrompt2 = `
      I am trying to create my portrait.\n
      Create my portrait suitable for my category with an anime or fairytale effect.\n
      Hide your hands as naturally as possible, or draw your hands without any gestures.
    `;

    // realistic portrait
    const imagePrompt3 = `
      I am trying to create realistic portrait.\n
      Please make my portrait suitable for my category.\n
      Hide your hands as naturally as possible, or draw your hands without any gestures.
    `;

    // realistic digital photo
    const imagePrompt4 = `
      Also I am trying to create realistic digital photo.\n
      If possible, focus on the background and create as few people as possible.\n
      And if you have to create a person, please create a European or an Asian.
    `;

    const imagePromptPrefix = `
      I'm trying to create an image to upload when posting a blog.\n
      Please create a prompt to create this image.\n
      Output only the prompt in text format and do not return anything else.\n
      When creating prompts, consider the following:\n
      Prompts should be simple and clear.\n
    `;
    const imagePromptPostfix = `
      \n\n\n
      Output should less than 70 tokens (about 250 characters or 50 words).
    `;
    const random = Math.random();
    if (random > 0.8)
      history.push({
        role: "user",
        content: `${imagePromptPrefix}${imagePrompt1}${imagePromptPostfix}`,
      });
    else if (random > 0.6)
      history.push({
        role: "user",
        content: `${imagePromptPrefix}${imagePrompt2}${imagePromptPostfix}`,
      });
    else if (random > 0.4)
      history.push({
        role: "user",
        content: `${imagePromptPrefix}${imagePrompt3}${imagePromptPostfix}`,
      });
    else
      history.push({
        role: "user",
        content: `${imagePromptPrefix}${imagePrompt4}${imagePromptPostfix}`,
      });

    const result3 = await axios.post(
      endpoint,
      {
        model: model,
        messages: history,
        keep_alive: "24h",
        stream: false,
      },
      config,
    );
    console.log("\t", "Generated prompt ...");
    history.push(result3.data.message);
    const prompt = result3.data.message.content
      .trim()
      .replace(/painting/gi, "photo");
    console.log("\t", "Parsed prompt ...");

    return {
      title,
      subtitle,
      slug,
      category: articleInfo.category,
      hashtags,
      content,
      originalContent,
      prompt: prompt[0] === '"' ? prompt.slice(1, -1) : prompt,
    };
  } catch (error) {
    console.error(
      "Error during get article:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};
