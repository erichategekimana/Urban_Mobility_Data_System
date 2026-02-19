# Urban_Mobility_Data_System -- Backend

This project provides a rubust ETL pipeline and RESTful API for analyzing NYC yellow taxi trip data(January 2019). It processes millions of records to provide insights into urban transit patterns.


Task sheet link: https://docs.google.com/spreadsheets/d/1cY-gDM9p97ebjDCl-70Ybk8HoxvNKTeniHe7gmiydN4/edit?gid=0#gid=0

Link to our trello: https://trello.com/invite/b/696677801090ad1325ce602d/ATTI3bedcb7f7813ee570f9fec3a1be0b6fcF601691B/teamsetupandprojectplanning

## System Architecture

* **Backend:** Python Flask API providing RESTful endpoints for spatial and statistical data.
* **Database:** PostgreSQL with PostGIS for spatial data management and trip record storage.
* **Frontend:** JavaScript-based dashboard utilizing Leaflet.js for mapping and Chart.js for data visualization.

## Prerequisites

Before installation, ensure the following are installed on your system:
* PostgreSQL (Version 13 or higher)
* Python (Version 3.10 or higher)
* Bash environment (Native on Ubuntu/Linux)

## Installation and Database Setup

The project includes a comprehensive automation script, `setup_db.sh`, which handles the creation of the PostgreSQL database, user permissions, and the configuration of the Python virtual environment.

### Step 1: Clone the Repository
Clone the project to your local directory:
'git clone https://github.com/erichategekimana/Urban_Mobility_Data_System'
'cd Urban_Mobility_Data_System'

### Step 2: Execute the Setup Script
Run the automated setup script. This script will prompt you for your PostgreSQL administrative credentials to create the necessary database objects.
chmod +x setup_db.sh
./setup_db.sh

This script performs the following actions:
1.  Creates the `nyc_taxi_data` database.
2.  Initializes the database schema.
3.  Creates a Python virtual environment and installs required dependencies from `requirements.txt`.
4.  Prepares the environment for data ingestion.

### Step 3: Load Data
After the environment is set up, initiate the ETL process to load the January 2019 dataset into your PostgreSQL instance.
'source venv/bin/activate'
'python3 etl/load_zones.py'
'python3 etl/load_trips.py'
### N.M: Run load_zones.py before load_trips.py


## Running the Application

### Start the Backend API
Navigate to the backend directory and run the Flask server:
python app.py

The API will be accessible at `http://localhost:5000/api`.

### Launch the Dashboard
Open the `index.html` file in a web browser to view the analytics dashboard. The interface is divided into three primary sections:
* **Home:** Summary statistics and spatial zone map.
* **Analytics:** Hourly trip distribution and borough performance charts.
* **Top 10:** Detailed rankings of the busiest zones in the city.

## API Endpoints

* `GET /api/summary`: Returns aggregate metrics for total trips, fares, and speed.
* `GET /api/hourly-stats`: Provides trip counts grouped by hour for time-series analysis.
* `GET /api/borough-stats`: Returns efficiency and tipping metrics grouped by borough.
* `GET /api/zones`: Provides GeoJSON data for spatial visualization.
* `GET /api/trends`: return trends, but not used yet
* `GET /api/top-locations`It provides top 10 busiest locations
