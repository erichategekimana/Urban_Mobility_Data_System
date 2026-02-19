#!/bin/bash
# This script helps set up the postgresql database, creates the user/role, and runs the table creation script.




echo "Checking system requirements..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null
then
    echo "Error: PostgreSQL is not installed on this system."
    echo "Please install it using: sudo apt update && sudo apt install postgresql postgresql-contrib"
    echo ""
    exit 1
else
    echo "PostgreSQL found."
fi

# Check if the PostgreSQL service is actually running
if ! systemctl is-active --quiet postgresql
then
    echo "PostgreSQL service is not running."
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi




echo "Setting up the PostgreSQL database..."
echo ""
# Create the user/role

# Prompt the user for the username and password for the PostgreSQL role
read -p "Enter the username for the PostgreSQL role (Ex: eric): " username
# Validate that the password is at least 4 characters long
while true; do
    read -p "Enter the password for the PostgreSQL role (Ex: eric123): " password
    if [[ ${#password} -ge 4 ]]; then
        break
    else
        echo "Password must be at least 4 characters long. Please try again."
    fi
done

# Create the role with SUPERUSER and CREATEDB privileges
sudo -u postgres psql -c "CREATE ROLE $username WITH LOGIN SUPERUSER PASSWORD '$password';"
sudo -u postgres psql -c "ALTER ROLE $username WITH CREATEDB;"
echo ""

# This will run table creation script(create tables, indexes, etc.)
echo "Initialize the Database structure..."
psql -U $username -d postgres -f database_setup.sql

echo "Database setup complete!"

# Add the database URI to .bashrc for easy access in the future
echo "export POSTGRES_DATABASE_URI=\"postgresql://$username:$password@localhost:5432/nyc_taxi_data\"" >> ~/.bashrc
echo ""


# Define the name of the virtual environment folder
VENV_DIR=".venv"

echo "Checking for Python virtual environment..."

# 1. Check if the directory exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Virtual environment not found. Creating it now..."
    
    # Check if python3-venv is installed (common issue on Ubuntu)
    if ! dpkg -l | grep -q python3-venv; then
        echo "python3-venv is missing. Installing it..."
        sudo apt update && sudo apt install -y python3-venv
    fi

    python3 -m venv $VENV_DIR
    echo "Virtual environment created at $VENV_DIR."
else
    echo "Virtual environment already exists."
fi

# 2. Activate and update pip/dependencies
echo "Installing/Updating dependencies..."
source $VENV_DIR/bin/activate
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "Dependencies installed."
else
    echo "requirements.txt not found. Skipping package installation."
fi


echo ""
echo "Database URI added to .bashrc. Please run 'source ~/.bashrc' to apply the changes."
echo ""
read -p "Press Enter to quit..."