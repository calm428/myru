import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assistantRoutes from "./routes/assistant.routes.mjs";

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "API-KEY"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan("common"));
app.use(express.json());
app.use(express.static("public"));

app.use("/api/assistant", assistantRoutes);

app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "public",
      "index.html",
    ),
  );
});

export default app;
