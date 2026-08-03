from app import app
from db import db
from models import User, Interview, InterviewAnswer
from datetime import datetime, timedelta


def create_user_if_missing(full_name, email, mobile, age, role, password='Password123'):
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(full_name=full_name, email=email, mobile=mobile, age=age, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()
    return user


def create_interview_if_missing(user, interview_type, difficulty, time_taken, answered, score, created_at):
    existing = Interview.query.filter_by(user_id=user.id, interview_type=interview_type, difficulty_level=difficulty, overall_score=score).first()
    if existing:
        return existing
    interview = Interview(
        user_id=user.id,
        interview_type=interview_type,
        difficulty_level=difficulty,
        time_taken=time_taken * 60,
        answered_count=answered,
        total_questions=10,
        overall_score=score,
        created_at=created_at
    )
    db.session.add(interview)
    db.session.flush()
    return interview


def add_answers(interview, qa_pairs):
    existing_questions = {a.question_text.strip().lower() for a in InterviewAnswer.query.filter_by(interview_id=interview.id).all()}
    for idx, (question, answer) in enumerate(qa_pairs, start=1):
        if question.strip().lower() in existing_questions:
            continue
        answer_row = InterviewAnswer(
            interview_id=interview.id,
            question_number=idx,
            question_text=question,
            answer_text=answer,
            is_answered=bool(answer.strip())
        )
        db.session.add(answer_row)


def seed():
    with app.app_context():
        db.create_all()

        # Add the Darji Sujal candidate profile
        darji = create_user_if_missing(
            full_name='Darji Sujal',
            email='darji.sujal@example.com',
            mobile='9898989898',
            age=24,
            role='Student',
            password='Sujal@2026'
        )

        # Add other sample users, if missing
        create_user_if_missing('Ananya Patel', 'ananya.patel@example.com', '9845012345', 20, 'Student')
        create_user_if_missing('Rohan Sharma', 'rohan.sharma@example.com', '9876512340', 22, 'Student')
        create_user_if_missing('Priya Singh', 'priya.singh@example.com', '9876512341', 24, 'Professional')
        create_user_if_missing('Kartik Mehta', 'kartik.mehta@example.com', '9876512342', 27, 'Professional')
        create_user_if_missing('Neha Iyer', 'neha.iyer@example.com', '9876512343', 23, 'Student')
        create_user_if_missing('Amit Kumar', 'amit.kumar@example.com', '9876512344', 28, 'Professional')

        admin = create_user_if_missing('MockMentor AI Administrator', 'admin@mockmentorai.com', '0000000000', 30, 'Administrator', password='admin123')

        # Assign custom report data for Darji Sujal
        intv1 = create_interview_if_missing(
            darji,
            'Technical Interview',
            'Hard',
            18,
            5,
            78,
            datetime.utcnow() - timedelta(days=5)
        )
        add_answers(intv1, [
            (
                'Tell me about a recent project where you solved a difficult technical problem.',
                'Recently I worked on a recruitment dashboard that was timing out with large data sets. I isolated the issue to multiple unindexed database joins, rewrote the query to use pre-aggregated views, and reduced load time from 16 seconds to under 3 seconds.'
            ),
            (
                'How do you write code so it remains easy for others to understand and maintain?',
                'I write small functions with descriptive names, add short comments only where logic is not obvious, and keep consistent formatting. I also document assumptions and review the code with the team before merging.'
            ),
            (
                'When debugging a production issue, what steps do you take first?',
                'I first reproduce the issue from logs or request details, then check recent deployments and error traces. I validate the input data, isolate the failing service, and apply a fix in a development branch before testing it in staging.'
            ),
            (
                'Explain how you ensure API responses remain fast and reliable under load.',
                'I cache repeated queries at the service boundary, keep responses compact, and add timeout retries. I also monitor slow endpoints so I can optimize only the bottlenecks that matter under real traffic.'
            ),
            (
                'What is your approach when your team has to deliver under a tight deadline?',
                'I focus on the most important features first, reduce scope by removing non-essential enhancements, and communicate clearly about what can be delivered safely. I avoid shortcuts that create technical debt.'
            )
        ])

        intv2 = create_interview_if_missing(
            darji,
            'HR Interview',
            'Medium',
            14,
            5,
            85,
            datetime.utcnow() - timedelta(days=3)
        )
        add_answers(intv2, [
            (
                'Why are you interested in this internship opportunity?',
                'I want to work in a fast-paced product team where I can learn from senior engineers and contribute to real user-facing features. This role fits my interest in building scalable web systems and improving my communication skills.'
            ),
            (
                'Describe a time when you had to work with a difficult teammate.',
                'In my last project, a teammate and I had different ideas about the architecture. I invited them to explain their point, shared my concerns respectfully, and we agreed on a hybrid solution that reduced risk while preserving performance.'
            ),
            (
                'How do you keep learning outside of your coursework?',
                'I follow tech blogs, build small side projects, and read library documentation. Recently I completed an online course on microservices and experimented with Docker to understand deployment patterns.'
            ),
            (
                'What do you consider your strongest soft skill?',
                'My strongest soft skill is clear communication. I make sure everyone understands the problem, I ask questions when needed, and I summarize decisions so the team stays aligned.'
            ),
            (
                'How do you handle feedback on your work?',
                'I welcome feedback and see it as an opportunity to improve. I note the suggestions, ask clarifying questions if needed, and update my approach for the next task.'
            )
        ])

        intv3 = create_interview_if_missing(
            darji,
            'System Design Interview',
            'Hard',
            20,
            5,
            72,
            datetime.utcnow() - timedelta(days=1)
        )
        add_answers(intv3, [
            (
                'Design a URL shortening service. What are the main components you would include?',
                'I would include a web frontend for user requests, an API service to generate and resolve short links, a database for mappings, and caching for hot URLs. I would also add analytics and rate limiting to prevent abuse.'
            ),
            (
                'How would you choose a database for storing short URL mappings?',
                'I would choose a fast key-value store for lookups and a relational store if I need analytics or user-owned links. For the main redirect path, I prefer a distributed cache like Redis backed by a durable store.'
            ),
            (
                'How do you handle collisions when generating short codes?',
                'I would first try a deterministic hash and then check for collisions in the database. If a collision occurs, I would regenerate using a different salt or append a sequence until I get a unique key.'
            ),
            (
                'What mechanism would you use to make the service scalable for millions of users?',
                'I would split the service into read and write paths, shard the database, and use CDN edge caches for redirects. I would also use stateless API servers behind a load balancer and autoscale based on traffic.'
            ),
            (
                'How would you ensure the service can recover quickly after an outage?',
                'I would keep automated backups, use health checks with many replicas, and deploy infrastructure as code. I would also have a rollback plan and alerts that notify the team immediately on failures.'
            )
        ])

        db.session.commit()
        print('Seed data created successfully for Darji Sujal.')


if __name__ == '__main__':
    seed()
