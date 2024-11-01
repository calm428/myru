const OpenAI = require("openai");
const path = require("node:path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

module.exports = async function generateArticle(
  articleInfo,
  email = "test@test.me",
) {
  const model = "gpt-4-turbo-preview";
  const openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
    maxRetries: 0,
  });
  const system_prompt = {
    role: "system",
    content: "You are a helpful social blog writer. Write in informal tone.",
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
        I have to parse using JSON in js code. So return with following json format with markdown json block: \`\`\`json + \`\`\`. And also return only json. Do not print additional information such as comments.\n
        ${JSON.stringify({
          title: "TITLE",
          subtitle: "SUBTITLE",
          slug: "SLUG",
          hashtags: ["HASHTAG1", "HASHTAG2"],
        })}
        \n\n\n
        The title should represent the basic content of the blog, and the subtitle may include a brief description or other information. Also, the slug is for a URL and should not contain any spaces or capital letters.
        `,
    });
    const result1 = await openai.chat.completions.create({
      model: model,
      messages: history,
    });
    console.log("\t", "Generated metadata ...");
    history.push(result1.choices[0].message);
    const { title, subtitle, slug, hashtags } = extractJSON(
      result1.choices[0].message.content,
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
    const result2 = await openai.chat.completions.create({
      model: model,
      messages: history,
    });
    console.log("\t", "Generated content ...");
    history.push(result2.choices[0].message);
    const content = extractHTML(result2.choices[0].message.content);
    const originalContent = result2.choices[0].message.content;
    console.log("\t", "Parsed content ...");

    // work room portrait
    const imagePrompt1 = `
      I'm trying to create an image to upload when posting a blog.\n
      Please create a prompt to create this image.\n
      Output only the prompt in text format and do not return anything else.\n
      When creating prompts, consider the following:\n
      Prompts should be simple and clear.\n
      I am trying to create realistic photo.\n
      Create vivid photos that show where I work.\n
      If possible, focus on the background and avoid creating people as much as possible.
    `;
    // anima or fairytale portrait
    const imagePrompt2 = `
      I'm trying to create an image to upload when posting a blog.\n
      Please create a prompt to create this image.\n
      Output only the prompt in text format and do not return anything else.\n
      When creating prompts, consider the following:\n
      Prompts should be simple and clear.\n
      I am trying to create my portrait.\n
      Create my portrait suitable for my category with an anime or fairytale effect.\n
      Hide your hands as naturally as possible, or draw your hands without any gestures.
    `;

    // realistic portrait
    const imagePrompt3 = `
      I'm trying to create an image to upload when posting a blog.\n
      Please create a prompt to create this image.\n
      Output only the prompt in text format and do not return anything else.\n
      When creating prompts, consider the following:\n
      Prompts should be simple and clear.\n
      I am trying to create realistic portrait.\n
      Please make my portrait suitable for my category.\n
      Hide your hands as naturally as possible, or draw your hands without any gestures.
    `;

    // realistic digital photo
    const imagePrompt4 = `
      I'm trying to create an image to upload when posting a blog.\n
      Please create a prompt to create this image.\n
      Output only the prompt in text format and do not return anything else.\n
      When creating prompts, consider the following:\n
      Prompts should be simple and clear.\n
      Also I am trying to create realistic digital photo.\n
      If possible, focus on the background and create as few people as possible.\n
      And if you have to create a person, please create a European or an Asian.
    `;

    const random = Math.random();
    if (random > 0.8)
      history.push({
        role: "user",
        content: imagePrompt1,
      });
    else if (random > 0.6)
      history.push({
        role: "user",
        content: imagePrompt2,
      });
    else if (random > 0.4)
      history.push({
        role: "user",
        content: imagePrompt3,
      });
    else
      history.push({
        role: "user",
        content: imagePrompt4,
      });

    const result3 = await openai.chat.completions.create({
      model: model,
      messages: history,
    });
    console.log("\t", "Generated prompt ...");
    history.push(result3.choices[0].message);
    const prompt = result3.choices[0].message.content
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
