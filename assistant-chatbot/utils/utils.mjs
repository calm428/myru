import axios from "axios";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const loadRoleMap = () => {
  try {
    const data = readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "role_map.json",
      ),
      { encoding: "utf8" },
    );
    const roleMap = JSON.parse(data);
    return roleMap;
  } catch (error) {
    console.error("Error reading file:", error);
    return {};
  }
};
const roleMap = loadRoleMap();

export const llmRequestor = async (
  system_prompt,
  history,
  uri = "/api/chat",
) => {
  const endpoint = `https://${process.env.LLM_POD_ID}-11434.proxy.runpod.net${uri}`;
  const config = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  };

  const result = await axios.post(
    endpoint,
    {
      model: process.env.LLM_MODEL,
      messages: [
        {
          role: "system",
          content: system_prompt,
        },
        ...history,
      ],
      keep_alive: "24h",
      stream: false,
    },
    config,
  );

  return result.data.message;
};

export const llmRequestorStream = (
  system_prompt,
  history,
  uri = "/api/chat",
) => {
  const endpoint = `https://${process.env.LLM_POD_ID}-11434.proxy.runpod.net${uri}`;
  const config = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    responseType: "stream",
  };

  const result = axios.post(
    endpoint,
    {
      model: process.env.LLM_MODEL,
      messages: [
        {
          role: "system",
          content: system_prompt,
        },
        ...history,
      ],
      keep_alive: "24h",
      stream: true,
    },
    config,
  );

  return result;
};

export const vlmRequestor = async (prompt, images, uri = "/api/generate") => {
  const endpoint = `https://${process.env.VLM_POD_ID}-11434.proxy.runpod.net${uri}`;
  const config = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  };

  const result = await axios.post(
    endpoint,
    {
      model: process.env.VLM_MODEL,
      prompt,
      images,
      keep_alive: "24h",
      stream: false,
    },
    config,
  );

  return result.data;
};

export const vlmRequestorStream = (prompt, images, uri = "/api/generate") => {
  const endpoint = `https://${process.env.VLM_POD_ID}-11434.proxy.runpod.net${uri}`;
  const config = {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    responseType: "stream",
  };

  const result = axios.post(
    endpoint,
    {
      model: process.env.VLM_MODEL,
      prompt,
      images,
      keep_alive: "24h",
      stream: true,
    },
    config,
  );

  return result;
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

export const getLang = (langCode) => {
  const langMap = {
    en: "English",
    ru: "Russian",
    es: "Spanish",
    ka: "Georgian",
  };
  return langMap[langCode] ?? "English";
};

export const generateCategorySentences = (categories, lang = "en") => {
  const sentences = categories.map((category) => {
    const role =
      roleMap[lang][category] ??
      {
        ...roleMap.ka,
        ...roleMap.es,
        ...roleMap.ru,
        ...roleMap.en,
      }[category];
    if (role) {
      return `In the realm of ${category}, he (she) is known as a "${role}".`;
    }
    return `In the realm of ${category}, he (she) is known as a "Guru".`;
  });

  return `
    He (She) specialize in the following areas: ${categories.join(", ")}.\n
    ${sentences.join("\n")}
  `;
};
