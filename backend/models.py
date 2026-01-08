from datetime import datetime
try:
    from .db import db
except ImportError:
    from db import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    supabase_uid = db.Column(db.String(64), unique=True, nullable=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(120))
    password_hash = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ProgressEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    module = db.Column(db.String(64), nullable=False)
    event_type = db.Column(db.String(64), nullable=False)
    score_delta = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module': self.module,
            'event_type': self.event_type,
            'score_delta': self.score_delta,
            'created_at': self.created_at.isoformat(),
        }


class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    module = db.Column(db.String(64), nullable=False)
    question_data = db.Column(db.Text, nullable=True)  # Stores the question text or details
    user_answer = db.Column(db.String(255), nullable=True)
    is_correct = db.Column(db.Boolean, default=False)
    score_earned = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module': self.module,
            'question_data': self.question_data,
            'user_answer': self.user_answer,
            'is_correct': self.is_correct,
            'score_earned': self.score_earned,
            'created_at': self.created_at.isoformat(),
        }


class LeaderboardEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    score = db.Column(db.Integer, default=0)

    def to_dict(self):
        user = User.query.get(self.user_id)
        return {
            'user_id': self.user_id,
            'name': user.name if user else 'Guest',
            'score': self.score,
        }


