// A small script that modifies the DATABASE_URL environment variable 
// for the current process and runs the seed.
const { execSync } = require('child_process');
const oldUrl = process.env.DATABASE_URL;
let newUrl = oldUrl;
if (newUrl.includes('.net/?')) {
  newUrl = newUrl.replace('.net/?', '.net/bolsa_materiais?');
} else if (newUrl.endsWith('.net/')) {
  newUrl = newUrl + 'bolsa_materiais';
}
console.log("Using URL:", newUrl);
process.env.DATABASE_URL = newUrl;
execSync('npx prisma generate', { stdio: 'inherit' });
execSync('npm run seed', { stdio: 'inherit' });
