#!/bin/bash

# Generate Prisma client based on your schema
echo "Generating Prisma client..."
npx prisma generate

# Push the schema to the database without creating migrations
echo "Pushing schema to the database..."
npx prisma db push --force-reset

echo "Database setup completed!"