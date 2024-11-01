const { login } = require("./utils/pax_login");

async function authenticate() {
  try {
    const { token, authInfo, cookie, session, closeWebSocket } = await login({
      email: "info@ddrw.ru",
      password: "123123123",
    });
    console.log("Authenticated:", authInfo);
    console.log("AccessToken:", token);
    console.log("Cookie:", cookie);
    console.log("Session:", session);
    closeWebSocket();
    // You can now use authInfo, cookie, and session
  } catch (error) {
    console.error("Error during login:", error.message);
    throw error;
  }
}

authenticate();
