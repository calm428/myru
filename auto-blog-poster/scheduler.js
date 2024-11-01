const schedule = require("node-schedule");
const postArticles = require("./post_articles_with_scheduler");

// Function to schedule the action 3 to 5 times every 3 hours
function scheduleActions() {
  // Post 3 articles first
  postArticles(3);
  // Schedule a job to run every 3 hours
  schedule.scheduleJob("0 */3 * * *", () => {
    console.log("Job started at: ", new Date().toLocaleTimeString());

    // Determine the number of times to execute the action (between 3 and 5)
    const timesToExecute = Math.floor(Math.random() * (5 - 3 + 1) + 3);

    console.log(`Scheduled to execute: ${timesToExecute} times`);
    postArticles(timesToExecute);
  });
}

scheduleActions();
