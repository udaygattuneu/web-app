name: Integration Tests


env:
    DATABASE_HOSTNAME: ${{ secrets.DB_HOST }}
    DATABASE_USER: ${{ secrets.DB_USER }}
    DATABASE_PASSWORD: ${{ secrets.DB_PASSWORD }}
    DB_PORT: ${{ secrets.DB_PORT }}
    DATABASE_Name: ${{ secrets.DB_NAME }}
 
on:
  pull_request:
    branches:
      - main
  


jobs:
  integration-test:
    runs-on: ubuntu-latest
 
    steps:
      - name : Install MySQL
        run: |
          sudo apt-get update
          sudo systemctl start mysql.service
          sudo mysql --user="${{ secrets.DB_USER }}" --password="${{ secrets.DB_PASSWORD }}" -e "CREATE DATABASE IF NOT EXISTS \`${{ secrets.DB_NAME }}\`;"
      - name: Checkout Repository
        uses: actions/checkout@v2
 
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "20"
 
      - name: Install Dependencies
        run: npm install
 
      - name: Run Tests
        run: npm test

# 