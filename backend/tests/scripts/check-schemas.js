const pg = require('pg');

async function main() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.snosllatpxyohcytbdhg:ISlamKhaledAli@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'
  });

  const client = await pool.connect();
  try {
    // Check public schema
    await client.query('SET search_path TO public');
    const pub = await client.query('SELECT count(*) as cnt FROM products');
    console.log('Public schema products count:', pub.rows[0].cnt);

    // Check fashion_store_test schema
    await client.query('SET search_path TO fashion_store_test');
    const test = await client.query('SELECT count(*) as cnt FROM products');
    console.log('fashion_store_test schema products count:', test.rows[0].cnt);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
