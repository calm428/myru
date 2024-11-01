import axios from "axios";

export const llmRequestor = async (history) => {
  const model = process.env.LLM_MODEL;
  const system_prompt = {
    role: "system",
    content: "You are a helpful social blog writer. Write in informal tone.",
  };
  const endpoint = `https://${process.env.LLM_POD_ID}-11434.proxy.runpod.net/api/chat`;
  const config = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  };

  const result = await axios.post(
    endpoint,
    {
      model: model,
      messages: [system_prompt, ...history],
      keep_alive: "24h",
      stream: false,
    },
    config,
  );

  return result.data.message;
};

export const errorHandler = (
  res,
  errorCode = 400,
  errorMessage = "An error occurred",
  error = { message: "No additional error info" },
) => {
  const errorInfo = error.response
    ? error.response.error || error.response.data
    : error.error || error.message;
  console.error(
    `Error - ${errorMessage}: ${
      typeof errorInfo === "string" ? errorInfo : JSON.stringify(errorInfo)
    }`,
  );

  return res
    .status(errorCode)
    .send(
      process.env.NODE_ENV === "development"
        ? `[ERROR (${errorMessage})]: ${
            typeof errorInfo === "string"
              ? errorInfo
              : JSON.stringify(errorInfo)
          }`
        : errorMessage,
    );
};

export const extractJSON = (text, type = "object") => {
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

export const extractHTML = (content) => {
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

export const getLang = (langCode) => {
  const langMap = {
    en: "English",
    ru: "Russian",
    es: "Spanish",
    ka: "Georgian",
  };
  return langMap[langCode] ?? "English";
};
