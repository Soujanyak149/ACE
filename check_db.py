import os
import sys
from backend.app import create_app
from backend.db import db
from backend.models import User, UserProgress, ProgressEvent

app = create_app()
with app.app_context():
    print(f"Users: {User.query.count()}")
    for user in User.query.all():
        print(f"  - {user.id}: {user.email} (Name: {user.name})")
    
    print(f"UserProgress Summary:")
    print(f"  Total: {UserProgress.query.count()}")
    print(f"  Logged-in records (with user_id): {UserProgress.query.filter(UserProgress.user_id != None).count()}")
    print(f"  Guest records (user_id is NULL): {UserProgress.query.filter(UserProgress.user_id == None).count()}")
    
    print("\nLast 10 records (Total):")
    for log in UserProgress.query.order_by(UserProgress.id.desc()).limit(10).all():
        print(f"  - ID: {log.id}, User: {log.user_id}, Module: {log.module}, Score: {log.score_earned}")
