import {
  errorHandler,
  extractHTML,
  extractJSON,
  llmRequestor,
  getLang,
} from "../utils/utils.mjs";

/**
 * @api {post} /api/assistant/titles Generate Titles for Blog Post
 * @apiName GetTitles
 *
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 * @apiBody {String} category The category of the blog post.
 * @apiBody {Array} hashtags The hashtags of the blog post.
 * @apiBody {String} [title] The original title (optional) to enhance title suggestions.
 * @apiBody {Object} [personalInfo] Additional personal information (optional) for context.
 *
 * @apiSuccess {Object[]} titles JSON array containing title suggestions.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "titles": [
 *         { "title": "TITLE1" },
 *         { "title": "TITLE2" },
 *         { "title": "TITLE3" }
 *       ]
 *     }
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) TitleGenerationError The titles cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
export const getTitleHelper = async (req, res) => {
  try {
    const {
      title: originalTitle,
      category,
      hashtags,
      personalInfo,
      lang,
    } = req.body;
    if (!category || !hashtags || hashtags.length === 0) {
      return errorHandler(res, 403, "The request is incorrect");
    }

    const history = [];

    console.log("Start generating ...");
    history.push({
      role: "user",
      content: `
        ${
          Object.keys(personalInfo ?? {}) !== 0 &&
          `This is my personal info:\n${JSON.stringify(
            personalInfo,
            null,
            2,
          )}\n\n\n`
        }
        I want post about ${category}.\n
        These are hashtags about my blog: ${hashtags.join(", ")}\n
        Please give me three candidate titles based on my category.\n
        ${!!lang && `Print in ${getLang(lang)} Language\n`}
        The title should represent the basic content of the blog.\n
        ${
          !!originalTitle &&
          `Use this as a basic title to get enhanced results: ${originalTitle}`
        }
        I have to parse using JSON in js code. So return with following json format with markdown json block: \`\`\`json + \`\`\`. And also return only json. Do not print additional information such as comments.\n
        ${JSON.stringify([
          { title: "TITLE1" },
          { title: "TITLE2" },
          { title: "TITLE3" },
        ])}
      `,
    });

    const maxTryNum = 3;
    for (let i = 0; i < maxTryNum; i++) {
      let result;
      try {
        let generateError = false;
        try {
          result = await llmRequestor(history);
        } catch (error) {
          generateError = true;
        }
        if (generateError)
          return errorHandler(
            res,
            500,
            "An error occurred while generating the titles",
            error,
          );

        console.log("\t", "Generated titles ...");
        const titles = extractJSON(result.content, "array");
        console.log("\t", "Parsed titles ...");

        if (titles) return res.status(200).json({ titles });
      } catch (error) {}
    }
    return errorHandler(res, 500, "The titles cannot be generated", {
      message: "The number of attempts has been exceeded",
    });
  } catch (error) {
    return errorHandler(res, 500, "An unknown error occurred", error);
  }
};

/**
 * @api {post} /api/assistant/subtitles Generate Subtitles for Blog Post
 * @apiName GetSubtitles
 *
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 * @apiBody {String} category The category of the blog post to aid subtitle generation.
 * @apiBody {Array} hashtags The hashtags of the blog post.
 * @apiBody {String} title The title of the blog post for which subtitles are being generated.
 * @apiBody {String} [subtitles] The original subtitles (optional) to enhance subtitle suggestions.
 * @apiBody {Object} [personalInfo] Additional personal information (optional) for context.
 *
 * @apiSuccess {Object[]} subtitles JSON array containing subtitle suggestions.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "subtitles": [
 *         { "subtitle": "SUBTITLE1" },
 *         { "subtitle": "SUBTITLE2" },
 *         { "subtitle": "SUBTITLE3" }
 *       ]
 *     }
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) SubtitleGenerationError The subtitles cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
export const getSubtitleHelper = async (req, res) => {
  try {
    const {
      title,
      subtitle: originalSubtitle,
      category,
      hashtags,
      personalInfo,
      lang,
    } = req.body;
    if (!category || !hashtags || hashtags.length === 0 || !title) {
      return errorHandler(res, 403, "The request is incorrect");
    }

    const history = [];

    console.log("Start generating ...");
    history.push({
      role: "user",
      content: `
        ${
          Object.keys(personalInfo ?? {}) !== 0 &&
          `This is my personal info:\n${JSON.stringify(
            personalInfo,
            null,
            2,
          )}\n\n\n`
        }
        I want post about ${category}.\n
        These are hashtags about my blog: ${hashtags.join(", ")}\n
        This is title of my blog: ${title}\n
        Please give me three candidate subtitles based on my category and title.\n
        ${!!lang && `Print in ${getLang(lang)} Language\n`}
        The subtitle should be a brief explanation of the main title.\n
        ${
          !!originalSubtitle &&
          `Use this as a basic subtitle to get enhanced results: ${originalSubtitle}`
        }
        Don't write in "words: specific descriptive" format like this: "Maximizing ROI: Leveraging Data for Personalized Marketing", just write only description like this: "Leveraging Data for Personalized Marketing".\n
        I have to parse using JSON in js code. So return with following json format with markdown json block: \`\`\`json + \`\`\`. And also return only json. Do not print additional information such as comments.\n
        ${JSON.stringify([
          { subtitle: "SUBTITLE1" },
          { subtitle: "SUBTITLE2" },
          { subtitle: "SUBTITLE3" },
        ])}
      `,
    });

    const maxTryNum = 3;
    for (let i = 0; i < maxTryNum; i++) {
      let result;
      try {
        let generateError = false;
        try {
          result = await llmRequestor(history);
        } catch (error) {
          generateError = true;
        }
        if (generateError)
          return errorHandler(
            res,
            500,
            "An error occurred while generating the titles",
            error,
          );

        console.log("\t", "Generated subtitles ...");
        const subtitles = extractJSON(result.content, "array");
        console.log("\t", "Parsed subtitles ...");

        if (subtitles) return res.status(200).json({ subtitles });
      } catch (error) {}
    }
    return errorHandler(res, 500, "The subtitles cannot be generated", {
      message: "The number of attempts has been exceeded",
    });
  } catch (error) {
    return errorHandler(res, 500, "An unknown error occurred", error);
  }
};

/**
 * @api {post} /api/assistant/content Generate Content for Blog Post
 * @apiName GetContent
 *
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 * @apiBody {String} category The category of the blog to tailor the content accordingly.
 * @apiBody {Array} hashtags The hashtags of the blog post.
 * @apiBody {String} title The title of the blog post for content generation.
 * @apiBody {String} subtitle The subtitle of the blog post.
 * @apiBody {String} [content] The original content (if any) for enhancing the generated content.
 * @apiBody {Object} [personalInfo] Additional personal information for context (optional).
 *
 * @apiSuccess {String} content The generated content in HTML format.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "content": "<p>Generated content based on the input...</p>"
 *     }
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) ContentGenerationError The content cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
export const getContentHelper = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      content: originalContent,
      category,
      hashtags,
      personalInfo,
      lang,
    } = req.body;
    if (
      !category ||
      !hashtags ||
      hashtags.length === 0 ||
      !title ||
      !subtitle
    ) {
      return errorHandler(res, 403, "The request is incorrect");
    }

    const history = [];

    console.log("Start generating ...");
    history.push({
      role: "user",
      content: `
        ${
          Object.keys(personalInfo ?? {}) !== 0 &&
          `This is my personal info:\n${JSON.stringify(
            personalInfo,
            null,
            2,
          )}\n\n\n`
        }
        I want post about ${category}.\n
        These are hashtags about my blog: ${hashtags.join(", ")}\n
        This is title of my blog: ${title}\n
        This is subtitle of my blog: ${subtitle}\n
        Please give me candidate content based on my category title, and subtitle.\n
        ${!!lang && `Print in ${getLang(lang)} Language\n`}
        Write professionally yet interestingly.\n
        ${
          !!originalContent &&
          `Use this as a basic content to get enhanced results:\n${originalContent}\n\n\n`
        }
        Write in quill editor's HTML format with markdown html block: \`\`\`html + \`\`\`. But don't use header tags such as h1, h2, h3. Use paragraph, string, list, strong, italic, underline, break, and other tags.\n
        Return only HTML code, without any additional text.
      `,
    });

    const maxTryNum = 3;
    for (let i = 0; i < maxTryNum; i++) {
      let result;
      try {
        let generateError = false;
        try {
          result = await llmRequestor(history);
        } catch (error) {
          generateError = true;
        }
        if (generateError)
          return errorHandler(
            res,
            500,
            "An error occurred while generating the titles",
            error,
          );

        console.log("\t", "Generated content ...");
        const content = extractHTML(result.content);
        console.log("\t", "Parsed content ...");

        if (content) return res.status(200).json({ content });
      } catch (error) {}
    }
    return errorHandler(res, 500, "The content cannot be generated", {
      message: "The number of attempts has been exceeded",
    });
  } catch (error) {
    return errorHandler(res, 500, "An unknown error occurred", error);
  }
};

/**
 * @api {post} /api/assistant/hashtags Generate Hashtags for Blog Post
 * @apiName GetHashtags
 *
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 * @apiBody {String} category The category of the content to tailor the hashtags.
 * @apiBody {String} title The title of the blog post for which hashtags are being generated.
 * @apiBody {String} subtitle The subtitle of the blog post.
 * @apiBody {String} content The main content of the blog to generate relevant hashtags.
 * @apiBody {Object} [personalInfo] Additional personal information for context (optional).
 *
 * @apiSuccess {String[]} hashtags An array of suggested hashtags relevant to the content and category.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "hashtags": [
 *         { "hashtag": "#hashtag1" },
 *         { "hashtag": "#hashtag2" },
 *         { "hashtag": "#hashtag3" },
 *         ...
 *         { "hashtag": "#hashtag10" },
 *       ]
 *     }
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) HashtagGenerationError The hashtags cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
// export const getHashtagsHelper = async (req, res) => {
//   try {
//     const { title, subtitle, content, category, personalInfo, lang } = req.body;
//     if (!category || !title || !subtitle || !content) {
//       return errorHandler(res, 403, "The request is incorrect");
//     }

//     const history = [];

//     console.log("Start generating ...");
//     history.push({
//       role: "user",
//       content: `
//         ${
//           Object.keys(personalInfo ?? {}) !== 0 &&
//           `This is my personal info:\n${JSON.stringify(personalInfo, null, 2)}\n\n\n`
//         }
//         I want post about ${category}.\n
//         This is title of my blog: ${title}\n
//         This is subtitle of my blog: ${subtitle}\n
//         This is content of my blog:\n
//         \`\`\`\n${content}\n\`\`\`\n\n\n
//         Please give me ten candidate hashtags based on blog.\n
//         ${!!lang && `Print in ${getLang(lang)} Language\n`}
//         I have to parse using JSON in js code. So return with following json format with markdown json block: \`\`\`json + \`\`\`. And also return only json. Do not print additional information such as comments.\n
//         ${JSON.stringify([
//           { hashtag: "HASHTAG1" },
//           { hashtag: "HASHTAG2" },
//           { hashtag: "HASHTAG3" },
//           { hashtag: "HASHTAG4" },
//           { hashtag: "HASHTAG5" },
//           { hashtag: "HASHTAG6" },
//           { hashtag: "HASHTAG7" },
//           { hashtag: "HASHTAG8" },
//           { hashtag: "HASHTAG9" },
//           { hashtag: "HASHTAG10" },
//         ])}
//       `,
//     });

//     const maxTryNum = 3;
//     for (let i = 0; i < maxTryNum; i++) {
//       let result;
//       try {
//         let generateError = false;
//         try {
//           result = await llmRequestor(history);
//         } catch (error) {
//           generateError = true;
//         }
//         if (generateError)
//           return errorHandler(
//             res,
//             500,
//             "An error occurred while generating the titles",
//             error,
//           );

//         console.log("\t", "Generated hashtags ...");
//         const hashtags = extractJSON(result.content, "array");
//         console.log("\t", "Parsed hashtags ...");

//         if (hashtags) return res.status(200).json({ hashtags });
//       } catch (error) {}
//     }
//     return errorHandler(res, 500, "The hashtags cannot be generated", {
//       message: "The number of attempts has been exceeded",
//     });
//   } catch (error) {
//     return errorHandler(res, 500, "An unknown error occurred", error);
//   }
// };
