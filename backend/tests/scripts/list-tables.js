const pg = require('pg');

async function main() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.snosllatpxyohcytbdhg:ISlamKhaledAli@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'
  });

  const client = await pool.connect();
  try {
    const schemas = await client.query(`
      SELECT schema_name FROM information_schema.schemata;
    `);
    console.log('All schemas:', schemas.rows.map(r => r.schema_name));

    const tables = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'fashion_store_test');
    `);
    console.log('Tables in public and fashion_store_test:');
    console.table(tables.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
