import os
import sys
import importlib.util

# Ensure backend/app is in Python path for intra-app module imports
app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

# Dynamically import backend/app/main.py to prevent circular import of backend/main.py
spec = importlib.util.spec_from_file_location("app_main", os.path.join(app_dir, "main.py"))
app_main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_main)

app = app_main.app
