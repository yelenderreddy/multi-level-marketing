import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config(); // Loads .env variables into process.env

const { HOST, PORT, USER, PASSWORD, DATABASE } = process.env;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schemas",
  out: "./drizzle",
  dbCredentials: {
    url: `postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`,
  },
});
