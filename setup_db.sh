#!/bin/bash
# This script helps set up the postgresql database, creates the user/role, and runs the table creation script.
echo "Setting up the PostgreSQL database..."
# Create the user/role

read -p "Enter the username for the PostgreSQL role (Ex: eric): " username
read -p "Enter the password for the PostgreSQL role (Ex: eric123): " password
sudo -u postgres psql -c "CREATE ROLE $username WITH LOGIN SUPERUSER PASSWORD '$password';"
sudo -u postgres psql -c "ALTER ROLE $username WITH CREATEDB;"

# This will run table creation script(create tables, indexes, etc.)
psql -U $username -d postgres -f database_setup.sql

echo "Database setup complete!"

echo "export DATABASE_URI="postgresql://$username:$password@localhost:5432/nyc_taxi_data"" >> ~/.bashrc