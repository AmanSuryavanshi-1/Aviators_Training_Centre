#!/bin/bash
echo "Starting Sanity Studio..."
echo
cd studio
echo "Installing dependencies..."
npm install
echo
echo "Starting studio on http://localhost:3333..."
npm run dev