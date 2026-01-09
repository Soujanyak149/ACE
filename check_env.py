import os
from dotenv import load_dotenv
from pathlib import Path

# Load from both possible locations
_backend_env_path = Path('backend/.env')
_root_env_path = Path('.env')
load_dotenv(dotenv_path=_backend_env_path, override=False)
load_dotenv(dotenv_path=_root_env_path, override=False)

print(f"ACE_FORCED_DB_URI: {os.environ.get('ACE_FORCED_DB_URI')}")
print(f"DATABASE_URL: {os.environ.get('DATABASE_URL')}")
print(f"FLASK_ENV: {os.environ.get('FLASK_ENV')}")
