from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
import jwt
from functools import wraps
from pathlib import Path

# Load environment variables from .env file
_backend_env_path = Path(__file__).with_name('.env')
_root_env_path = Path(__file__).resolve().parents[1] / '.env'
load_dotenv(dotenv_path=_backend_env_path, override=False)
load_dotenv(dotenv_path=_root_env_path, override=False)

try:
    # Try relative imports (when run as module)
    from .db import db, init_db
    from .models import User, ProgressEvent, LeaderboardEntry, UserProgress
    from .utils.adaptive import (
        generate_language_question,
        generate_puzzle_question,
    )
    from .validators import (
        ProgressEventSchema,
        UserProgressSchema,
        QuestionRequestSchema,
        UserRegistrationSchema,
        UserLoginSchema,
        validate_request_data,
        sanitize_integer
    )
except ImportError:
    # Fallback to absolute imports (when run directly)
    from db import db, init_db
    from models import User, ProgressEvent, LeaderboardEntry, UserProgress
    from utils.adaptive import (
        generate_language_question,
        generate_puzzle_question,
    )
    from validators import (
        ProgressEventSchema,
        UserProgressSchema,
        QuestionRequestSchema,
        UserRegistrationSchema,
        UserLoginSchema,
        validate_request_data,
        sanitize_integer
    )


def create_app():
    # Ensure we're using the project root's instance folder
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    app = Flask(__name__, 
                template_folder=os.path.join(project_root, 'templates'),
                static_folder=os.path.join(project_root, 'static'))
    
    # Get secret key from environment variable
    secret_key = os.environ.get('ACE_SECRET')
    if not secret_key:
        # Only use default in development
        if os.environ.get('FLASK_ENV') == 'production':
            raise ValueError("ACE_SECRET environment variable must be set in production!")
        secret_key = 'dev_secret_DO_NOT_USE_IN_PRODUCTION'
        print("WARNING: Using default secret key. Set ACE_SECRET in production!")
    
    app.config['SECRET_KEY'] = secret_key
    
    instance_path = os.path.join(project_root, 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    db_path = os.path.join(instance_path, 'ace.db')
    # Force use of SQLite for local development and simplicity
    abs_db_path = os.path.abspath(db_path).replace("\\", "/")
    sqlite_uri = f'sqlite:///{abs_db_path}'
    
    # We'll stick to SQLite for now to solve the 'psycopg' module error
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('ACE_FORCED_DB_URI', sqlite_uri)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    print(f"✨ Using Database: {app.config['SQLALCHEMY_DATABASE_URI']}")

    # Get CORS origins from environment
    cors_origins = os.environ.get('CORS_ORIGINS', '*')
    if cors_origins != '*':
        cors_origins = cors_origins.split(',')
    
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})
    db.init_app(app)
    
    # Fix for Eventlet/SQLAlchemy threading issues on Render/SQLite
    from sqlalchemy.pool import NullPool
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'poolclass': NullPool}
    
    init_db(app)
    return app


app = create_app()
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')


def _get_bearer_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header:
        return None
    parts = auth_header.split(' ', 1)
    if len(parts) != 2:
        return None
    scheme, token = parts[0].strip().lower(), parts[1].strip()
    if scheme != 'bearer' or not token:
        return None
    return token


def _verify_supabase_jwt(token: str):
    secret = os.environ.get('SUPABASE_JWT_SECRET')
    if not secret:
        raise ValueError('SUPABASE_JWT_SECRET is not configured')

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=['HS256'],
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_aud': False,
                'verify_iss': False,
            },
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')


def get_current_user(optional: bool = True):
    """Return a local User mapped to the Supabase JWT, or None if not authenticated."""
    token = _get_bearer_token()
    if not token:
        if optional:
            return None
        raise ValueError('Missing bearer token')

    payload = _verify_supabase_jwt(token)
    supabase_uid = payload.get('sub')
    email = (payload.get('email') or '').strip().lower()
    name = (payload.get('user_metadata') or {}).get('name') or ''

    if not supabase_uid:
        raise ValueError('Invalid token payload')

    user = User.query.filter_by(supabase_uid=supabase_uid).first()
    if not user and email:
        # If a legacy user exists by email, link it to Supabase.
        user = User.query.filter_by(email=email).first()
        if user and not user.supabase_uid:
            user.supabase_uid = supabase_uid

    if not user:
        user = User(
            supabase_uid=supabase_uid,
            email=email or f"{supabase_uid}@supabase.local",
            name=(name or (email.split('@')[0] if email else 'User')),
            password_hash=None,
            created_at=datetime.utcnow(),
        )
        db.session.add(user)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    return user


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user = get_current_user(optional=False)
        except ValueError as e:
            return jsonify({'error': str(e)}), 401
        return fn(user, *args, **kwargs)

    return wrapper


# --------------------- HEALTH CHECK ---------------------
@app.get('/api/health')
def health_check():
    """Health check endpoint for monitoring backend status"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'services': {
            'database': 'connected',
            'socketio': 'active'
        }
    }), 200


# --------------------- AUTH ---------------------
@app.post('/api/auth/register')
def register():
    data = request.get_json(force=True) or {}

    validated_data, errors = validate_request_data(UserRegistrationSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400

    email = (validated_data.get('email') or '').strip().lower()
    name = (validated_data.get('name') or '').strip()
    password = validated_data.get('password') or ''

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    try:
        user = User(
            email=email,
            name=name or email.split('@')[0],
            password_hash=generate_password_hash(password),
            created_at=datetime.utcnow(),
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({
            'message': 'Registered',
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error registering user: {e}")
        return jsonify({'error': 'Failed to register user'}), 500


@app.post('/api/auth/login')
def login():
    data = request.get_json(force=True) or {}

    validated_data, errors = validate_request_data(UserLoginSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400

    email = (validated_data.get('email') or '').strip().lower()
    password = validated_data.get('password') or ''

    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({
        'message': 'Logged in',
        'user_id': user.id,
        'email': user.email,
        'name': user.name,
    })


@app.get('/api/auth/me')
@require_auth
def auth_me(user):
    return jsonify({
        'user_id': user.id,
        'email': user.email,
        'name': user.name,
        'supabase_uid': user.supabase_uid,
    })


# ----------------- LANGUAGE API -----------------
@app.get('/api/language/next')
def language_next():
    category = request.args.get('category', 'synonyms')
    level = int(request.args.get('level', '1'))
    question = generate_language_question(category, level)
    return jsonify(question)


# ------------------ PUZZLE API ------------------
@app.get('/api/puzzle/next')
def puzzle_next():
    puzzle_type = request.args.get('type', 'sequence')
    level = int(request.args.get('level', '1'))
    puzzle = generate_puzzle_question(puzzle_type, level)
    return jsonify(puzzle)


# ----------------- PROGRESS API -----------------
@app.post('/api/progress/event')
def progress_event():
    """Record a progress event with validation"""
    data = request.get_json(force=True) or {}
    
    # Validate input data
    validated_data, errors = validate_request_data(ProgressEventSchema, data)
    
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    try:
        auth_user = None
        try:
            auth_user = get_current_user(optional=True)
        except Exception:
            auth_user = None

        effective_user_id = auth_user.id if auth_user else validated_data.get('user_id')

        event = ProgressEvent(
            user_id=effective_user_id,
            module=validated_data['module'],
            event_type=validated_data['event_type'],
            score_delta=validated_data['score_delta'],
            created_at=datetime.utcnow(),
        )
        db.session.add(event)

        # Update leaderboard if user provided and score changed
        if effective_user_id and validated_data['score_delta'] != 0:
            entry = LeaderboardEntry.query.filter_by(
                user_id=effective_user_id
            ).first()
            
            if not entry:
                entry = LeaderboardEntry(
                    user_id=effective_user_id,
                    score=0
                )
                db.session.add(entry)
            
            entry.score = (entry.score or 0) + validated_data['score_delta']

        db.session.commit()
        
        return jsonify({
            'message': 'Progress recorded successfully',
            'event_id': event.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error recording progress: {e}")
        return jsonify({'error': 'Failed to record progress'}), 500


@app.post('/api/progress/submit')
def progress_submit():
    """Submit detailed progress for a specific question"""
    data = request.get_json(force=True) or {}
    
    validated_data, errors = validate_request_data(UserProgressSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    try:
        auth_user = None
        try:
            auth_user = get_current_user(optional=True)
        except Exception:
            auth_user = None

        effective_user_id = auth_user.id if auth_user else validated_data.get('user_id')

        # Save detailed progress
        progress = UserProgress(
            user_id=effective_user_id,
            module=validated_data['module'],
            question_data=validated_data['question_data'],
            user_answer=validated_data['user_answer'],
            is_correct=validated_data['is_correct'],
            score_earned=validated_data['score_earned'],
            created_at=datetime.utcnow(),
        )
        db.session.add(progress)

        # Also create a general ProgressEvent for compatibility with existing systems
        event = ProgressEvent(
            user_id=effective_user_id,
            module=validated_data['module'],
            event_type='question_answered',
            score_delta=validated_data['score_earned'],
            created_at=datetime.utcnow(),
        )
        db.session.add(event)

        # Update leaderboard
        if effective_user_id and validated_data['score_earned'] != 0:
            entry = LeaderboardEntry.query.filter_by(user_id=effective_user_id).first()
            if not entry:
                entry = LeaderboardEntry(user_id=effective_user_id, score=0)
                db.session.add(entry)
            entry.score = (entry.score or 0) + validated_data['score_earned']

        db.session.commit()
        
        return jsonify({
            'message': 'Progress submitted successfully',
            'progress_id': progress.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error submitting progress: {e}")
        return jsonify({'error': 'Failed to submit progress'}), 500


@app.get('/api/progress/summary')
def progress_summary():
    auth_user = None
    try:
        auth_user = get_current_user(optional=True)
    except Exception:
        auth_user = None

    user_id = auth_user.id if auth_user else request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400

    user_id = int(user_id)
    
    # Get general events
    events = ProgressEvent.query.filter_by(user_id=user_id).order_by(ProgressEvent.created_at.desc()).limit(100).all()
    
    # Get detailed progress
    detailed_progress = UserProgress.query.filter_by(user_id=user_id).order_by(UserProgress.created_at.desc()).limit(100).all()

    totals = {}
    # Calculate totals from events
    all_events = ProgressEvent.query.filter_by(user_id=user_id).all()
    for e in all_events:
        key = e.module
        totals.setdefault(key, {'events': 0, 'score': 0, 'correct': 0, 'total_questions': 0})
        totals[key]['events'] += 1
        totals[key]['score'] += (e.score_delta or 0)

    # Use database aggregation for accuracy metrics to avoid loading all detailed records
    from sqlalchemy import func
    accuracy_stats = db.session.query(
        UserProgress.module,
        func.count(UserProgress.id).label('total'),
        func.sum(UserProgress.is_correct.cast(db.Integer)).label('correct')
    ).filter(UserProgress.user_id == user_id).group_by(UserProgress.module).all()

    for module, total, correct in accuracy_stats:
        totals.setdefault(module, {'events': 0, 'score': 0, 'correct': 0, 'total_questions': 0})
        totals[module]['total_questions'] = total
        totals[module]['correct'] = int(correct or 0)

    user_info = {}
    u = db.session.get(User, user_id)
    if u:
        user_info = {'id': u.id, 'name': u.name, 'email': u.email}

    return jsonify({
        'by_module': totals, 
        'events': [e.to_dict() for e in events], 
        'detailed_progress': [p.to_dict() for p in detailed_progress],
        'user': user_info
    })


@app.get('/api/leaderboard/top')
def leaderboard_top():
    top = LeaderboardEntry.query.order_by(LeaderboardEntry.score.desc()).limit(20).all()
    return jsonify([e.to_dict() for e in top])


# -------------- QUIZ BATTLE SOCKETS -------------
rooms_waiting = []


@socketio.on('connect')
def on_connect():
    emit('connected', {'message': 'connected'})


@socketio.on('join_lobby')
def on_join_lobby(data):
    user = (data or {}).get('user', 'guest')
    rooms_waiting.append(request.sid)
    emit('lobby_joined', {'you': user, 'waiting': len(rooms_waiting)})


@socketio.on('matchmake')
def on_matchmake(data):
    if len(rooms_waiting) >= 2:
        a = rooms_waiting.pop(0)
        b = rooms_waiting.pop(0)
        room = f"room:{a[:5]}:{b[:5]}"
        join_room(room, sid=a)
        join_room(room, sid=b)
        socketio.emit('match_found', {'room': room}, room=room)
    else:
        emit('waiting', {'message': 'waiting for opponent'})


@socketio.on('join_room')
def on_join_room(data):
    room = data.get('room')
    if room:
        join_room(room)
        emit('room_joined', {'room': room}, room=room)


@socketio.on('chat_message')
def on_chat_message(data):
    room = data.get('room')
    msg = data.get('message')
    if room and msg:
        emit('chat_message', {'message': msg}, room=room)


# ------------------ PAGE ROUTES (CLEAN URLs) ------------------
from flask import render_template

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('progress_dashboard.html')

@app.route('/games/math')
def math_game():
    return render_template('math_game.html')

@app.route('/games/language')
def language_game():
    return render_template('language_game.html')

@app.route('/games/puzzle')
def puzzle_game():
    return render_template('puzzle_game.html')

@app.route('/games/quiz-battle')
def quiz_battle():
    return render_template('quiz_battle.html')

@app.route('/learn/programming')
def programming_learning():
    return render_template('programming_learning.html')


def run():
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)


if __name__ == '__main__':
    run()


