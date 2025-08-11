@echo off
echo Generating Prisma client...
npx prisma generate

echo Pushing schema to the database...
npx prisma db push --force-reset

echo Database setup completed!
pause