from datetime import datetime
import json
from werkzeug.security import generate_password_hash, check_password_hash
from db import db


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=True)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    mobile = db.Column(db.String(30), nullable=True)
    age = db.Column(db.Integer, nullable=True, default=21)
    role = db.Column(db.String(50), nullable=True, default='Student')
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {'id': self.id, 'full_name': self.full_name, 'email': self.email, 'mobile': self.mobile, 'age': self.age or 21, 'role': self.role or 'Student'}


class Interview(db.Model):
    __tablename__ = 'interviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interview_type = db.Column(db.String(50), default='Technical')
    difficulty_level = db.Column(db.String(20), default='Medium')
    time_taken = db.Column(db.Integer, default=0)  # in seconds
    answered_count = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=10)
    overall_score = db.Column(db.Integer, default=0) # Final performance score percentage
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    report_pdf = db.Column(db.LargeBinary, nullable=True) # PDF Report saved directly in DB
    
    # Relationship with answers
    answers = db.relationship('InterviewAnswer', backref='interview', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'interview_type': self.interview_type,
            'difficulty_level': self.difficulty_level,
            'time_taken': self.time_taken,
            'answered_count': self.answered_count,
            'total_questions': self.total_questions,
            'overall_score': self.overall_score,
            'has_pdf': self.report_pdf is not None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resume_data': self.resume_data.to_dict() if hasattr(self, 'resume_data') and self.resume_data else None
        }


class InterviewAnswer(db.Model):
    __tablename__ = 'interview_answers'
    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False)
    question_number = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    answer_text = db.Column(db.Text, nullable=True)
    is_answered = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'question_number': self.question_number,
            'question_text': self.question_text,
            'answer_text': self.answer_text,
            'is_answered': self.is_answered,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ResumeData(db.Model):
    __tablename__ = 'resume_data'
    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False, unique=True)
    degree = db.Column(db.String(150), nullable=True)
    college = db.Column(db.String(250), nullable=True)
    skills = db.Column(db.Text, nullable=True)          # JSON-serialized list
    experience = db.Column(db.Text, nullable=True)      # JSON-serialized list
    projects = db.Column(db.Text, nullable=True)        # JSON-serialized list
    certifications = db.Column(db.Text, nullable=True)  # JSON-serialized list
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One-to-one relationship back to Interview
    interview = db.relationship('Interview', backref=db.backref('resume_data', uselist=False, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'degree': self.degree,
            'college': self.college,
            'skills': json.loads(self.skills) if self.skills else [],
            'experience': json.loads(self.experience) if self.experience else [],
            'projects': json.loads(self.projects) if self.projects else [],
            'certifications': json.loads(self.certifications) if self.certifications else [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
