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
  // Check if directUrl should be included (for pooled serverless environments like Neon/Supabase)
  const useDirect = process.argv.includes('--direct') || Boolean(process.env.DIRECT_URL);
  
  const postgresDatasource = useDirect
    ? `datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}`
    : `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}`;

  content = content.replace(/datasource db \{[\s\S]*?\}/, postgresDatasource);
  fs.writeFileSync(schemaPath, content, 'utf8');
  
  console.log('✓ Successfully configured Prisma for PostgreSQL.');
  console.log('Datasource configuration:');
  console.log('  • provider  = "postgresql"');
  console.log('  • url       = env("DATABASE_URL")');
  if (useDirect) {
    console.log('  • directUrl = env("DIRECT_URL") (for migrations with connection poolers)');
  }
  console.log('\nProduction Deployment Commands:');
  console.log('  1. npx prisma migrate deploy        (apply production migrations)');
  console.log('  2. npx prisma generate              (regenerate Prisma client)');
  console.log('  3. node scripts/seed-admin.js       (provision admin account if needed)');
} else if (target === 'sqlite') {
  const sqliteDatasource = `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`;
  content = content.replace(/datasource db \{[\s\S]*?\}/, sqliteDatasource);
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('✓ Successfully configured Prisma for SQLite (Local Development).');
  console.log('  • provider = "sqlite"');
  console.log('  • url      = env("DATABASE_URL") (file:./dev.db)');
} else {
  console.error('Unknown target:', target, '(use "postgres" or "sqlite")');
  process.exit(1);
}
