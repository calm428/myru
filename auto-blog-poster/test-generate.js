const generateAndPostArticle = require("./generate_and_post_article");
const {
  getLocalUserProfiles,
  getDateStringForFileName,
  getRandomSublist,
} = require("./utils/utils");

const MALE_USER_FILE_PATH = "user-data/users_male.json";
const FEMALE_USER_FILE_PATH = "user-data/users_female.json";

(async () => {
  const maleUsers = await getLocalUserProfiles(MALE_USER_FILE_PATH);
  const femaleUsers = await getLocalUserProfiles(FEMALE_USER_FILE_PATH);

  const numberToPost = 3;
  const randomText = Math.random().toString(36).slice(2, 6);
  const dateText = getDateStringForFileName();
  for (const user of getRandomSublist(
    [...maleUsers, ...femaleUsers],
    numberToPost,
  )) {
    const res = await generateAndPostArticle(
      user,
      `${dateText}_${randomText}_${user.email}_article`,
      { postArticle: false, imageGenerate: false },
    );
    console.log(res);
  }
  console.log(`Generated ${numberToPost} blogs.`);
})();
