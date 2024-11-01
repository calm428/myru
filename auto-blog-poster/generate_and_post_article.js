const axios = require("axios");
const fs = require("node:fs");
const FormData = require("form-data");
const { login } = require("./utils/pax_login");
const generateArticle = require("./utils/generate_article_llm");
const generateImage = require("./utils/generate_article_image_sdxl");

const postArticle = async (articleData, session, token) => {
  try {
    const requestData = articleData;
    const headers = {
      Authorization: `Bearer ${token}`,
      Session: session,
      "Content-Type": "application/json",
    };
    const response = await axios.post(
      `https://go.paxintrade.com/api/blog/create?session=${session}`,
      requestData,
      { headers: headers },
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "Error posting article:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

const uploadImageFile = async (file_path, session, token) => {
  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(file_path));
    const formHeaders = formData.getHeaders();
    const uploadResponse = await axios.post(
      "https://go.paxintrade.com/api/files/upload/images",
      formData,
      {
        headers: {
          ...formHeaders,
          Authorization: `Bearer ${token}`,
          Session: session,
        },
      },
    );
    const imagePath = uploadResponse.data.files[0].path;
    return imagePath;
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

const uploadBlogImages = async (blogId, imageFilePath, session, token) => {
  try {
    const imagePath = await uploadImageFile(imageFilePath, session, token);
    const headers = {
      Authorization: `Bearer ${token}`,
      Session: session,
      "Content-Type": "application/json",
    };
    const response = await axios.post(
      `https://go.paxintrade.com/api/blog/create/photos?blogID=${blogId}`,
      {
        blogID: blogId,
        files: [
          {
            path: imagePath,
          },
        ],
      },
      {
        headers: headers,
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating blog photos:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

const authenticateAndPost = async (
  email,
  articleContent,
  articleMeta,
  imagePath,
) => {
  try {
    const { token, session, closeWebSocket } = await login({
      email: email,
      password: "123123",
    });
    try {
      const data = {
        title: articleContent.title,
        descr: articleContent.subtitle,
        slug: articleContent.slug,
        content: articleContent.content,
        lang: "en",
        city: articleMeta.cityIds,
        days: 30,
        catygory: articleMeta.categoryIds,
        total: 0,
        hashtags: articleContent.hashtags,
        status: "ACTIVE",
      };
      const blogPostRes = await postArticle(data, session, token);
      const uploadImgRes = await uploadBlogImages(
        blogPostRes.ID,
        imagePath,
        session,
        token,
      );
      return { blogPostRes, uploadImgRes };
    } catch (error) {
      console.error(
        "Error during posting:",
        error.response
          ? error.response.error || error.response.data
          : error.message,
      );
      throw error;
    } finally {
      closeWebSocket();
    }
  } catch (error) {
    console.error(
      "Error during login:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
    throw error;
  }
};

const generateAndPostArticle = async (
  user,
  fileName,
  options = { postArticle: true, imageGenerate: true },
) => {
  try {
    const targetPath = "blog-data/blogs";
    if (!fs.existsSync(targetPath)) {
      try {
        fs.mkdirSync(targetPath, { recursive: true });
        console.log("The directories were created successfully.");
      } catch (error) {
        console.error("Error creating directories:", error);
      }
    }

    const articleContent = await generateArticle(user.articleInfo, user.email);
    await fs.promises.writeFile(
      `${targetPath}/${fileName}-meta.json`,
      JSON.stringify({ articleContent, userInfo: user }, null, 2),
      "utf8",
    );
    await fs.promises.writeFile(
      `${targetPath}/${fileName}-content.md`,
      articleContent.content,
      "utf8",
    );
    await fs.promises.writeFile(
      `${targetPath}/${fileName}-original-content.txt`,
      articleContent.originalContent,
      "utf8",
    );

    if (options.imageGenerate) {
      await generateImage(
        articleContent.prompt,
        `${targetPath}/${fileName}-photo.png`,
      );
    }

    if (options.postArticle) {
      articleContent.hashtags = articleContent.hashtags.map((tag) => ({
        hashtag: tag[0] === "#" ? tag.slice(1) : tag,
      }));

      const postResult = await authenticateAndPost(
        user.email,
        articleContent,
        { cityIds: user.cityIds, categoryIds: user.categoryIds },
        `${targetPath}/${fileName}-photo.png`,
      );

      console.log(
        "Blog posted:\n",
        JSON.stringify(
          {
            ID: postResult.blogPostRes.ID,
            Title: postResult.blogPostRes.Title,
            User: user.email,
          },
          null,
          2,
        ),
      );
      return {
        id: postResult.blogPostRes.ID,
        uniqueId: postResult.blogPostRes.UniqId,
        title: postResult.blogPostRes.Title,
        description: postResult.blogPostRes.Descr,
        category: user.articleInfo.category,
        hashtags: postResult.blogPostRes.Hashtags.map((tag) => ({
          id: tag.ID,
          name: tag.Hashtag,
        })),
        prompt: articleContent.prompt,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          location: user.articleInfo.userProfile.location,
        },
      };
    }
    return "Successfully generated.";
  } catch (error) {
    console.error(
      "Error during generate and post blog:",
      error.response
        ? error.response.error || error.response.data
        : error.message,
      "Trying again ...",
    );
    return null;
  }
};

module.exports = generateAndPostArticle;
