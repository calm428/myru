import dotenv from "dotenv";
import app from "./app.mjs";

dotenv.config();

const port = process.env.PORT || 5050;
const host = process.env.HOSTNAME || "localhost";

app.listen(port, host, () => {
  console.log(`Server is running on port: ${host}:${port}`);
});
