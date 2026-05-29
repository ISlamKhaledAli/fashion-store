const pg = require('pg');

async function main() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres.snosllatpxyohcytbdhg:ISlamKhaledAli@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'
  });

  const client = await pool.connect();
  try {
    await client.query('SET search_path TO fashion_store_test');
    
    const before = await client.query('SELECT count(*) as cnt FROM products');
    console.log('Products BEFORE cleanup:', before.rows[0].cnt);

    const usersBefore = await client.query('SELECT count(*) as cnt FROM users');
    console.log('Users BEFORE cleanup:', usersBefore.rows[0].cnt);

    await client.query(`
      TRUNCATE TABLE
        product_tags, order_items, orders, cart_items, carts,
        reviews, wishlists, product_images, variants, products,
        brands, categories, addresses, discounts, tags, users
      RESTART IDENTITY CASCADE
    `);

    const after = await client.query('SELECT count(*) as cnt FROM products');
    console.log('Products AFTER cleanup:', after.rows[0].cnt);

    const usersAfter = await client.query('SELECT count(*) as cnt FROM users');
    console.log('Users AFTER cleanup:', usersAfter.rows[0].cnt);

    console.log('Test database cleaned successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
