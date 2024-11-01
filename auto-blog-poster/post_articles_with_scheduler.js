const fs = require("node:fs");
const generateAndPostArticle = require("./generate_and_post_article");
const {
  getLocalUserProfiles,
  getDateStringForFileName,
  getRandomSublist,
} = require("./utils/utils");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MALE_USER_FILE_PATH = "./user-data/users_male.json";
const FEMALE_USER_FILE_PATH = "./user-data/users_female.json";

const postArticles = async (numberToPost) => {
  console.log("--------------------------------");
  console.log(`${numberToPost} blogs are scheduled.`);
  console.log("--------------------------------");

  const maleUsers = await getLocalUserProfiles(MALE_USER_FILE_PATH);
  const femaleUsers = await getLocalUserProfiles(FEMALE_USER_FILE_PATH);

  const postResults = [];
  const randomText = Math.random().toString(36).slice(2, 6);
  const dateText = getDateStringForFileName();

  const users = getRandomSublist([...maleUsers, ...femaleUsers], numberToPost);
  for (const [index, user] of users.entries()) {
    const res = await generateAndPostArticle(
      user,
      `${dateText}_${randomText}_${user.email}_article`,
    );
    if (res) postResults.push(res);

    if (index < users.length - 1) {
      await delay(1000 * 60 * (~~(Math.random() * 10) + 10));
    }
  }
  await fs.promises.writeFile(
    `blog-data/post-results-${dateText}_${randomText}.json`,
    JSON.stringify(postResults, null, 2),
    "utf8",
  );

  console.log("--------------------------------");
  console.log(`Posted ${numberToPost} blogs.`);
  console.log("--------------------------------");
};

module.exports = postArticles;
