const pg = require('pg');

const connectionString = 'postgresql://postgres.snosllatpxyohcytbdhg:ISlamKhaledAli@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?schema=fashion_store_test&options=-c+search_path%3Dfashion_store_test';
const dbUrl = new URL(connectionString);
const schema = dbUrl.searchParams.get("schema");

async function main() {
  const pool = new pg.Pool({
    connectionString,
    options: schema ? `-c search_path=${schema}` : undefined
  });

  const client = await pool.connect();
  try {
    const showSearchPath = await client.query('SHOW search_path');
    const curSchema = await client.query('SELECT current_schema()');
    console.log('SHOW search_path:', showSearchPath.rows[0]);
    console.log('SELECT current_schema():', curSchema.rows[0]);

    const countRaw = await client.query('SELECT count(*) FROM products');
    console.log('SELECT count(*) FROM products:', countRaw.rows[0]);

    const countTest = await client.query('SELECT count(*) FROM "fashion_store_test".products');
    console.log('SELECT count(*) FROM "fashion_store_test".products:', countTest.rows[0]);

    const countPublic = await client.query('SELECT count(*) FROM "public".products');
    console.log('SELECT count(*) FROM "public".products:', countPublic.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
