const makeRequest = async (data, index) => {
  const startTime = Date.now();

  const url = "http://127.0.0.1:5050/api/assistant/chat";
  const config = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    // const responseData = await response.json();

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    console.log(`Request ${index} completed in ${timeTaken} ms.`);
  } catch (error) {
    console.error(
      `Request ${index} failed:`,
      error.response
        ? error.response.error || error.response.data
        : error.message,
    );
  }
};

const performLoadTest = async (numberOfRequests) => {
  const data = {
    profile: {
      categories: ["Management"],
      city: "Cork",
      bio: "Hello there! I'm Bryan Baker, a proud Irishman living in the vibrant city of Cork. I'm passionate about management and enjoy leading teams to success. Let's connect and exchange ideas, I'm always up for meeting new people! #ManagementEnthusiast #CorkLife #LetsConnect",
    },
    history: [{ role: "user", content: "Hi, there!" }],
    lang: "en",
  };

  console.log(
    `Starting load test with ${numberOfRequests} concurrent requests.`,
  );

  const promises = Array.from({ length: numberOfRequests }, (_, index) =>
    makeRequest(data, index),
  );

  const startTime = Date.now();

  await Promise.all(promises).then(() => {
    console.log(`Completed ${numberOfRequests} requests.`);
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    console.log(`Completed ${numberOfRequests} requests in ${timeTaken} ms.`);
  });
};

const CONCURRENT_REQUESTS = 10;

performLoadTest(CONCURRENT_REQUESTS);
