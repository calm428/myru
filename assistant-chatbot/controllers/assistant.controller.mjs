import {
  errorHandler,
  llmRequestor,
  llmRequestorStream,
  getLang,
  generateCategorySentences,
  vlmRequestor,
  vlmRequestorStream,
} from "../utils/utils.mjs";

/**
 * @api {post} /api/assistant/chat Chat with AI Assistant
 * @apiName assistantChat
 *
 * @apiBody {Object} profile Bot profile information for knowledge base.
 * @apiBody {Object[]} history The chat history.
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 *
 * @apiBodyExample {json}:
 *     {
 *       "profile": {
 *         "categories": [
 *           "Consulting",
 *           "Marketing"
 *         ],
 *         "bio": "Hi! This is a IT Master. Plz contact to discuss about IT."
 *       },
 *       "history": [
 *         {
 *           "role": "user",
 *           "content": "Hi, there!"
 *         }
 *       ],
 *       "lang": "en"
 *     }
 *
 * @apiSuccess {Object} JSON object containing assistant's response.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "role": "assistant",
 *       "content": "Hi, there! This is AI Assistant."
 *     }
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) ChatGenerationError The chat cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
export const assistantChat = async (req, res) => {
  try {
    const { profile, history, lang } = req.body;
    if (!profile || !history || history.length === 0) {
      return errorHandler(res, 403, "The request is incorrect");
    }

    const systemPrompt = `
      I want you to act like person.\n
      I want you to respond and answer like him (her) using the tone, manner and vocabulary him (her) would use.\n
      Do not write any explanations. Only answer like him (her).\n\n
      You must know all of the knowledge of him (her).\n
      ${generateCategorySentences(profile.categories, lang ?? "en")}\n
      His (Her) BIO is "${profile.bio}"\n
      Don't send a BIO as your first reply, just send a message about how you can help.\n
      Also, don't send hashtags or anything like that in your first response.\n\n
      My first sentence is "Hi, there!".\n\n
      ${!!lang && `Reply in ${getLang(lang)} Language`}
    `;

    try {
      console.log("Start generating ...");
      const result = await llmRequestor(systemPrompt, history);
      console.log("Chat is generated ...");
      return res.status(200).json({
        result: {
          role: "assistant",
          content: result.content.trim(),
        },
      });
    } catch (error) {
      return errorHandler(
        res,
        500,
        "An error occurred while generating the chat",
        error,
      );
    }
  } catch (error) {
    return errorHandler(res, 500, "An unknown error occurred", error);
  }
};

/**
 * @api {post} /api/assistant/chatStream Chat with AI Assistant
 * @apiName assistantChatStream
 *
 * @apiBody {Object} profile Bot profile information for knowledge base.
 * @apiBody {Object[]} history The chat history.
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 *
 * @apiBodyExample {json}:
 *     {
 *       "profile": {
 *         "categories": [
 *           "Consulting",
 *           "Marketing"
 *         ],
 *         "bio": "Hi! This is a IT Master. Plz contact to discuss about IT."
 *       },
 *       "history": [
 *         {
 *           "role": "user",
 *           "content": "Hi, there!"
 *         }
 *       ],
 *       "lang": "en"
 *     }
 *
 * @apiSuccess {Object[]} stream A sequence of JSON objects containing the assistant's response.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"model":"mixtral","created_at":"2024-03-05T16:56:07.966827852Z","message":{"role":"assistant","content":" Hello"},"done":false}
 *     {"model":"mixtral","created_at":"2024-03-05T16:56:09.070672635Z","message":{"role":"assistant","content":""},"done":true,"total_duration":1154565047,"load_duration":21599700,"prompt_eval_duration":25423000,"eval_count":56,"eval_duration":1103597000}
 *
 * @apiNote The response is streamed, and clients must be capable of handling chunked responses to process the full message.
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) ChatGenerationError The chat cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
export const assistantChatStream = async (req, res) => {
  try {
    const { profile, history, lang } = req.body;
    if (!profile || !history || history.length === 0) {
      return errorHandler(res, 403, "The request is incorrect");
    }

    const systemPrompt = `
      I want you to act like person.\n
      I want you to respond and answer like him (her) using the tone, manner and vocabulary him (her) would use.\n
      Do not write any explanations. Only answer like him (her).\n\n
      You must know all of the knowledge of him (her).\n
      ${generateCategorySentences(profile.categories, lang ?? "en")}\n
      His (Her) BIO is "${profile.bio}"\n
      Don't send a BIO as your first reply, just send a message about how you can help.\n
      Also, don't send hashtags or anything like that in your first response.\n\n
      My first sentence is "Hi, there!".\n\n
      ${!!lang && `Reply in ${getLang(lang)} Language`}
    `;

    console.log("Start generating ...");
    llmRequestorStream(systemPrompt, history)
      .then((llmRes) => {
        llmRes.data.pipe(res);
      })
      .catch((error) => {
        console.error("Error on API call:", error);
        res.status(500).send("An error occurred while generating the chat");
      });
  } catch (error) {
    return errorHandler(res, 500, "An unknown error occurred", error);
  }
};

/**
 * @api {post} /api/assistant/visionChat Chat with AI Assistant
 * @apiName assistantVisionChat
 *
 * @apiBody {String} content Message to ask.
 * @apiBody {Base64String[]} images Images list.
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 *
 * @apiBodyExample {json}:
 *     {
 *       "content": "What is in this picture?",
 *       "images": [
 *         "IMAGE1"
 *       ],
 *       // "lang": "en"
 *     }
 *
 * @apiSuccess {Object} JSON object containing assistant's response.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": "This is an apple."
 *     }
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) ChatGenerationError The chat cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
export const assistantVisionChat = async (req, res) => {
  try {
    const { content, images, lang } = req.body;
    if (!content || !images || images.length === 0) {
      return errorHandler(res, 403, "The request is incorrect");
    }

    // const prompt = `
    //   ${content}\n
    //   ${!!lang && `Reply in ${getLang(lang)} Language`}
    // `;
    const prompt = content;

    try {
      console.log("Start generating ...");
      const result = await vlmRequestor(prompt, images);
      console.log("Chat is generated ...");
      return res.status(200).json({
        result: result.response.trim(),
      });
    } catch (error) {
      return errorHandler(
        res,
        500,
        "An error occurred while generating the chat",
        error,
      );
    }
  } catch (error) {
    return errorHandler(res, 500, "An unknown error occurred", error);
  }
};

/**
 * @api {post} /api/assistant/visionChatStream Chat with AI Assistant
 * @apiName assistantVisionChatStream
 *
 * @apiBody {String} content Message to ask.
 * @apiBody {Base64String[]} images Images list.
 * @apiBody {String} [lang] The output language (optional, en|ru|es|ka available).
 *
 * @apiBodyExample {json}:
 *     {
 *       "content": "What is in this picture?",
 *       "images": [
 *         "IMAGE1"
 *       ],
 *       // "lang": "en"
 *     }
 *
 * @apiSuccess {Object[]} stream A sequence of JSON objects containing the assistant's response.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"model":"llava:34b","created_at":"2024-03-05T16:56:07.966827852Z","response":{"role":"assistant","content":"This"},"done":false}
 *     {"model":"llava:34b","created_at":"2024-03-05T16:56:07.966827852Z","response":{"role":"assistant","content":" is"},"done":false}
 *     {"model":"llava:34b","created_at":"2024-03-05T16:56:07.966827852Z","response":{"role":"assistant","content":" an"},"done":false}
 *     {"model":"llava:34b","created_at":"2024-03-05T16:56:09.070672635Z","response":{"role":"assistant","content":" apple"}, context: [1,2,3,4,5,6,7,8,9,0],"done":true,"total_duration":1154565047,"load_duration":21599700,"prompt_eval_duration":25423000,"eval_count":56,"eval_duration":1103597000}
 *
 * @apiNote The response is streamed, and clients must be capable of handling chunked responses to process the full message.
 *
 * @apiError (Error 403) IncorrectRequest The request is incorrect due to missing request body.
 * @apiError (Error 500) ChatGenerationError The chat cannot be generated.
 * @apiError (Error 500) UnknownError An unknown error occurred.
 */
export const assistantVisionChatStream = async (req, res) => {
  try {
    const { content, images, lang } = req.body;
    if (!content || !images || images.length === 0) {
      return errorHandler(res, 403, "The request is incorrect");
    }

    // const prompt = `
    //   ${content}\n
    //   ${!!lang && `Reply in ${getLang(lang)} Language`}
    // `;
    const prompt = content;

    console.log("Start generating ...");
    vlmRequestorStream(prompt, images)
      .then((vlmRes) => {
        vlmRes.data.pipe(res);
      })
      .catch((error) => {
        console.error("Error on API call:", error);
        res.status(500).send("An error occurred while generating the chat");
      });
  } catch (error) {
    return errorHandler(res, 500, "An unknown error occurred", error);
  }
};
