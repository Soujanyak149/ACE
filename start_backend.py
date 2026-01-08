#!/usr/bin/env python3
"""
ACE Learning Platform Backend Startup Script
This script starts the Flask backend server for the ACE learning platform.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

try:
    # Ensure we use the absolute path to the instance folder in project root
    project_root = Path(__file__).parent
    db_path = project_root / 'instance' / 'ace.db'
    # Use formatted string with forward slashes for SQLite URI conformity
    db_uri = f'sqlite:///{db_path.as_posix()}'
    
    os.environ['ACE_DB_URI'] = db_uri
    
    from app import run, app
    
    print("Starting ACE Learning Platform Backend...")
    print("Backend will be available at: http://localhost:5000")
    print("API endpoints available at: http://localhost:5000/api/")
    print("SocketIO for real-time features enabled")
    
    # Configure app to use the absolute path
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    print(f"Database: SQLite ({db_uri})")
    print("\n" + "="*50)
    print("Press Ctrl+C to stop the server")
    print("="*50 + "\n")
    
    # Start the server
    run()
    
except ImportError as e:
    print(f"Error importing backend modules: {e}")
    print("\nMake sure you have installed the required dependencies:")
    print("   python -m pip install flask flask-cors flask-socketio flask-sqlalchemy werkzeug marshmallow")
    print("\nOr install all at once:")
    print("   python -m pip install -r requirements.txt")
    print("\nQuick check - try this command:")
    print("   python -m pip show flask marshmallow")
    sys.exit(1)
except Exception as e:
    print(f"Error starting backend: {e}")
    sys.exit(1)
