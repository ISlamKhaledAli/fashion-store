const pg = require('pg');

async function main() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.snosllatpxyohcytbdhg:ISlamKhaledAli@aws-1-eu-west-3.pooler.supabase.com:5432/postgres',
    options: '-c search_path=fashion_store_test'
  });

  const client = await pool.connect();
  try {
    const searchPath = await client.query('SHOW search_path');
    const currentSchema = await client.query('SELECT current_schema()');
    console.log('SHOW search_path =', searchPath.rows[0]);
    console.log('SELECT current_schema() =', currentSchema.rows[0]);

    const prodCount = await client.query('SELECT count(*) as cnt FROM products');
    console.log('Products count in this connection:', prodCount.rows[0].cnt);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
