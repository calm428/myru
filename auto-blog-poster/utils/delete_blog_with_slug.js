const { Pool } = require("pg");
const path = require("node:path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

// PostgreSQL pool connection settings
const pool = new Pool({
  user: process.env.PG_USER ?? "postgres",
  host: process.env.PG_HOST ?? "localhost",
  database: process.env.PG_DB ?? "postgres",
  password: process.env.PG_PASSWD ?? "",
  port: Number.parseInt(process.env.PG_PORT) ?? 5432,
});

const deleteBlogAndRelatedRecords = async (slug) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const blogIdRes = await client.query(
      "SELECT id FROM blogs WHERE slug = $1",
      [slug],
    );
    if (blogIdRes.rows.length > 0) {
      // Ensure the column name matches what is returned by the SELECT query:
      const blogId = blogIdRes.rows[0].id; // Use .id instead of .blog_id if the column is indeed named `id`.

      // Continue with the deletion queries using the corrected blogId variable:
      await client.query("DELETE FROM blog_city WHERE blog_id = $1", [blogId]);
      await client.query("DELETE FROM blog_guilds WHERE blog_id = $1", [
        blogId,
      ]);
      await client.query("DELETE FROM blog_hashtags WHERE blog_id = $1", [
        blogId,
      ]);
      await client.query("DELETE FROM blog_photos WHERE blog_id = $1", [
        blogId,
      ]);
      await client.query("DELETE FROM votes WHERE blog_id = $1", [blogId]);
      // The blog table itself is correctly referenced here
      await client.query("DELETE FROM blogs WHERE id = $1", [blogId]);
    } else {
      console.log(`Can't find any blogs with the slug ${slug}`);
    }

    await client.query("COMMIT");
    if (blogIdRes.rows.length > 0) {
      console.log(
        `The blog with the slug ${slug} and its related records have been successfully deleted.`,
      );
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in transaction, ROLLBACK", error);
  } finally {
    client.release();
  }
};

(async () => {
  await deleteBlogAndRelatedRecords("test-blog");
})();
