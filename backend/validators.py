"""
Input validation schemas for API endpoints
"""
from marshmallow import Schema, fields, validate, ValidationError, validates, validates_schema


class ProgressEventSchema(Schema):
    """Validate progress event data"""
    user_id = fields.Integer(allow_none=True)
    module = fields.String(
        required=True,
        validate=validate.OneOf([
            'math', 'language', 'puzzle', 'quiz', 'programming'
        ], error="Invalid module name")
    )
    event_type = fields.String(
        required=True,
        validate=validate.Length(min=1, max=64)
    )
    score_delta = fields.Integer(
        required=True,
        validate=validate.Range(
            min=-1000,
            max=10000,
            error="Score delta must be between -1000 and 10000"
        )
    )


class UserProgressSchema(Schema):
    """Validate detailed user progress data"""
    user_id = fields.Integer(allow_none=True)
    module = fields.String(
        required=True,
        validate=validate.OneOf([
            'math', 'language', 'puzzle', 'quiz', 'programming'
        ], error="Invalid module name")
    )
    question_data = fields.String(required=True)
    user_answer = fields.String(required=True)
    is_correct = fields.Boolean(required=True)
    score_earned = fields.Integer(required=True)


class QuestionRequestSchema(Schema):
    """Validate question request parameters"""
    category = fields.String(
        validate=validate.Length(min=1, max=50)
    )
    level = fields.Integer(
        validate=validate.Range(
            min=1,
            max=3,
            error="Level must be between 1 and 3"
        )
    )
    user_id = fields.Integer(allow_none=True)
    puzzle_type = fields.String(
        validate=validate.Length(min=1, max=50)
    )


class UserRegistrationSchema(Schema):
    """Validate user registration data"""
    email = fields.Email(
        required=True,
        error_messages={'required': 'Email is required'}
    )
    password = fields.String(
        required=True,
        validate=validate.Length(
            min=6,
            max=128,
            error="Password must be between 6 and 128 characters"
        )
    )
    name = fields.String(
        validate=validate.Length(max=120)
    )
    
    @validates('email')
    def validate_email(self, value):
        if not value or '@' not in value:
            raise ValidationError('Invalid email format')


class UserLoginSchema(Schema):
    """Validate user login data"""
    email = fields.Email(required=True)
    password = fields.String(required=True)


def validate_request_data(schema_class, data):
    """
    Helper function to validate request data against a schema
    
    Args:
        schema_class: The schema class to use for validation
        data: The data dictionary to validate
        
    Returns:
        Tuple of (validated_data, errors)
    """
    schema = schema_class()
    try:
        validated_data = schema.load(data)
        return validated_data, None
    except ValidationError as err:
        return None, err.messages


# Sanitization helpers
def sanitize_string(text, max_length=1000):
    """Sanitize string input to prevent XSS"""
    if not text:
        return ""
    
    # Remove potential script tags
    text = str(text).replace('<script', '&lt;script')
    text = text.replace('</script>', '&lt;/script&gt;')
    
    # Limit length
    return text[:max_length].strip()


def sanitize_integer(value, min_val=None, max_val=None, default=0):
    """Safely convert to integer with bounds"""
    try:
        num = int(value)
        if min_val is not None and num < min_val:
            return min_val
        if max_val is not None and num > max_val:
            return max_val
        return num
    except (ValueError, TypeError):
        return default
