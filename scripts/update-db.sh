#!/bin/bash

echo "Running Prisma database migration..."
npx prisma db push

echo "Generating Prisma client..."
npx prisma generate

echo "Database setup complete!"