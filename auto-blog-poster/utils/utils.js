const fs = require("node:fs");

const getLocalUserProfiles = async (local_file_path) => {
  try {
    const data = await fs.promises.readFile(local_file_path, "utf-8");
    const profiles = JSON.parse(data);
    return profiles.map((input) => {
      const random = ~~(Math.random() * input.categories.length);
      return {
        userId: input.userId,
        email: input.email,
        name: input.name,
        articleInfo: {
          userProfile: {
            gender: input.gender,
            name: input.name,
            location: {
              city: input.location.city.name,
              country: input.location.country,
            },
            nat: input.nat,
            today: new Date().toISOString(),
          },
          category: input.categories[random].name,
        },
        cityIds: [
          {
            ID: input.location.city.id,
          },
        ],
        categoryIds: [{ ID: input.categories[random].id }],
      };
    });
  } catch (error) {
    console.error("Error while reading local user profiles:", error.message);
    throw error;
  }
};

const getRandomSublist = (originalList, count = 5) => {
  const listCopy = [...originalList];
  const resultList = [];
  const finalCount = Math.min(count, listCopy.length);
  for (let i = 0; i < finalCount; i++) {
    const randomIndex = Math.floor(Math.random() * listCopy.length);
    resultList.push(...listCopy.splice(randomIndex, 1));
  }
  return resultList;
};

const getDateStringForFileName = () => {
  const now = new Date();

  // Pad the month, day, hours, minutes, and seconds with leading zeros if they are less than 10
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Combine them in your preferred format
  const dateString = `${year}${month}${day}-${hours}${minutes}${seconds}`;
  return dateString;
};

const extractJSON = (text, type = "object") => {
  function tryParseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(
        `\n\n\nOops! No valid JSON data found!\n\`\`\`\n${text}\n\`\`\`\n\n\n`,
      );
      throw new Error("No valid JSON data found.");
    }
  }

  let match;
  let jsonString;
  let regex;
  let inlineRegex;

  const regexObject = /```(?:json)?\s*?\n?(\{[\s\S]*?\})\s*?\n?```/gm;
  const regexArray = /```(?:json)?\s*?\n?(\[[\s\S]*?\])\s*?\n?```/gm;
  const objectInlineRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/;
  const arrayInlineRegex = /\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]/;

  if (type === "array") {
    regex = regexArray;
    inlineRegex = arrayInlineRegex;
  } else {
    regex = regexObject;
    inlineRegex = objectInlineRegex;
  }

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((match = regex.exec(text)) !== null) {
    jsonString = match[1].trim();
    if (jsonString) {
      return tryParseJSON(jsonString);
    }
  }

  match = inlineRegex.exec(text);
  if (match) {
    jsonString = match[0];
    return tryParseJSON(jsonString);
  }

  return tryParseJSON(text);
};

const extractHTML = (content) => {
  const regexCodeBlock = /```(?:html)?\n([\s\S]*?)\n```/;
  const matchesCodeBlock = content.match(regexCodeBlock);
  if (matchesCodeBlock?.[1] && /<[^>]+>/.test(matchesCodeBlock[1])) {
    return matchesCodeBlock[1].trim();
  }

  const startsWithHtmlTagRegex = /^\s*<[^>]+>/;
  const endsWithHtmlTagRegex = /<\/[^>]+>\s*$/;
  if (
    startsWithHtmlTagRegex.test(content) &&
    endsWithHtmlTagRegex.test(content)
  ) {
    return content.trim();
  }

  const firstTagMatch = content.match(/<[^>]+>/);
  const lastTagMatch = content.match(/<\/[^>]+>$/);
  if (firstTagMatch && lastTagMatch) {
    const firstTagIndex = firstTagMatch.index;
    const lastTagIndex = content.lastIndexOf(lastTagMatch[0]);
    const extractedContent = content.substring(
      firstTagIndex,
      lastTagIndex + lastTagMatch[0].length,
    );
    return extractedContent;
  }

  const firstCompleteTagRegex = /<[^>]+>.*?<\/[^>]+>/s;
  const matchesFirstCompleteTag = content.match(firstCompleteTagRegex);
  if (matchesFirstCompleteTag) {
    return matchesFirstCompleteTag[0].trim();
  }

  throw new Error("No valid HTML content found.");
};

module.exports = {
  getLocalUserProfiles,
  getRandomSublist,
  getDateStringForFileName,
  extractJSON,
  extractHTML,
};
