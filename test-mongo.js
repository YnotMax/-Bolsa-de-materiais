const { MongoClient } = require('mongodb');
const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db('bolsa_materiais');
    const collections = await db.collections();
    console.log("Collections:", collections.map(c => c.collectionName));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
