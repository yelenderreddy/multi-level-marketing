import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schemas", // Path to your schema file
  out: "./drizzle", // Output directory for migrations
  dbCredentials: {
    url: "postgresql://postgres:reddy@localhost:5432/MLM_Db", // Replace with your PostgreSQL connection string
  },
});
