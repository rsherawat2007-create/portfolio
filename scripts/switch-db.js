const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'postgres';
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('schema.prisma not found at', schemaPath);
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');

if (target === 'postgres' || target === 'postgresql') {
  content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('✓ Successfully configured Prisma for PostgreSQL (Supabase).');
  console.log('Next step: ensure your DATABASE_URL in .env or Render is set to your Supabase connection string.');
  console.log('Then run: npx prisma db push');
} else if (target === 'sqlite') {
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('✓ Successfully configured Prisma for SQLite (Local).');
} else {
  console.error('Unknown target:', target, '(use "postgres" or "sqlite")');
  process.exit(1);
}
