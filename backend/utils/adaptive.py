"""
Adaptive learning utilities for generating questions and puzzles
"""

import random
from typing import Dict, List, Any


def generate_language_question(category: str = 'synonyms', level: int = 1) -> Dict[str, Any]:
    """
    Generate a language learning question based on category and level
    """
    questions = {
        'synonyms': {
            1: [
                {'question': 'Find the synonym for "Happy"', 'answer': 'Joyful', 'options': ['Joyful', 'Sad', 'Angry', 'Tired']},
                {'question': 'Find the synonym for "Big"', 'answer': 'Large', 'options': ['Large', 'Small', 'Tiny', 'Little']},
                {'question': 'Find the synonym for "Fast"', 'answer': 'Quick', 'options': ['Quick', 'Slow', 'Lazy', 'Calm']}
            ],
            2: [
                {'question': 'Find the synonym for "Beautiful"', 'answer': 'Gorgeous', 'options': ['Gorgeous', 'Ugly', 'Plain', 'Simple']},
                {'question': 'Find the synonym for "Smart"', 'answer': 'Intelligent', 'options': ['Intelligent', 'Dumb', 'Foolish', 'Silly']},
                {'question': 'Find the synonym for "Brave"', 'answer': 'Courageous', 'options': ['Courageous', 'Scared', 'Afraid', 'Timid']}
            ],
            3: [
                {'question': 'Find the synonym for "Magnificent"', 'answer': 'Splendid', 'options': ['Splendid', 'Ordinary', 'Common', 'Regular']},
                {'question': 'Find the synonym for "Persistent"', 'answer': 'Determined', 'options': ['Determined', 'Lazy', 'Weak', 'Soft']},
                {'question': 'Find the synonym for "Eloquent"', 'answer': 'Articulate', 'options': ['Articulate', 'Quiet', 'Silent', 'Mute']}
            ]
        },
        'antonyms': {
            1: [
                {'question': 'Find the antonym for "Hot"', 'answer': 'Cold', 'options': ['Cold', 'Warm', 'Boiling', 'Steaming']},
                {'question': 'Find the antonym for "Up"', 'answer': 'Down', 'options': ['Down', 'High', 'Above', 'Over']},
                {'question': 'Find the antonym for "Light"', 'answer': 'Dark', 'options': ['Dark', 'Bright', 'Clear', 'Visible']}
            ],
            2: [
                {'question': 'Find the antonym for "Generous"', 'answer': 'Selfish', 'options': ['Selfish', 'Kind', 'Nice', 'Friendly']},
                {'question': 'Find the antonym for "Honest"', 'answer': 'Dishonest', 'options': ['Dishonest', 'Truthful', 'Sincere', 'Genuine']},
                {'question': 'Find the antonym for "Patient"', 'answer': 'Impatient', 'options': ['Impatient', 'Calm', 'Quiet', 'Peaceful']}
            ],
            3: [
                {'question': 'Find the antonym for "Optimistic"', 'answer': 'Pessimistic', 'options': ['Pessimistic', 'Hopeful', 'Cheerful', 'Positive']},
                {'question': 'Find the antonym for "Diligent"', 'answer': 'Lazy', 'options': ['Lazy', 'Hardworking', 'Active', 'Energetic']},
                {'question': 'Find the antonym for "Authentic"', 'answer': 'Fake', 'options': ['Fake', 'Real', 'Genuine', 'Original']}
            ]
        },
        'definitions': {
            1: [
                {'question': 'What does "Serene" mean?', 'answer': 'Peaceful', 'options': ['Peaceful', 'Loud', 'Angry', 'Happy']},
                {'question': 'What does "Vast" mean?', 'answer': 'Huge', 'options': ['Huge', 'Small', 'Medium', 'Tiny']},
                {'question': 'What does "Swift" mean?', 'answer': 'Fast', 'options': ['Fast', 'Slow', 'Steady', 'Careful']}
            ],
            2: [
                {'question': 'What does "Eloquent" mean?', 'answer': 'Well-spoken', 'options': ['Well-spoken', 'Quiet', 'Loud', 'Shy']},
                {'question': 'What does "Persistent" mean?', 'answer': 'Determined', 'options': ['Determined', 'Lazy', 'Weak', 'Soft']},
                {'question': 'What does "Authentic" mean?', 'answer': 'Genuine', 'options': ['Genuine', 'Fake', 'Copy', 'Imitation']}
            ],
            3: [
                {'question': 'What does "Magnificent" mean?', 'answer': 'Splendid', 'options': ['Splendid', 'Ordinary', 'Plain', 'Simple']},
                {'question': 'What does "Diligent" mean?', 'answer': 'Hardworking', 'options': ['Hardworking', 'Lazy', 'Slow', 'Careless']},
                {'question': 'What does "Eloquent" mean?', 'answer': 'Articulate', 'options': ['Articulate', 'Quiet', 'Mute', 'Silent']}
            ]
        },
        'word-pairs': {
            1: [
                {'question': 'Complete the pair: "Hot and..."', 'answer': 'Cold', 'options': ['Cold', 'Warm', 'Boiling', 'Steaming']},
                {'question': 'Complete the pair: "Up and..."', 'answer': 'Down', 'options': ['Down', 'High', 'Above', 'Over']},
                {'question': 'Complete the pair: "Light and..."', 'answer': 'Dark', 'options': ['Dark', 'Bright', 'Clear', 'Visible']}
            ],
            2: [
                {'question': 'Complete the pair: "Give and..."', 'answer': 'Take', 'options': ['Take', 'Receive', 'Accept', 'Get']},
                {'question': 'Complete the pair: "Left and..."', 'answer': 'Right', 'options': ['Right', 'Correct', 'Proper', 'Good']},
                {'question': 'Complete the pair: "Win and..."', 'answer': 'Lose', 'options': ['Lose', 'Fail', 'Miss', 'Drop']}
            ],
            3: [
                {'question': 'Complete the pair: "Cause and..."', 'answer': 'Effect', 'options': ['Effect', 'Result', 'Outcome', 'Consequence']},
                {'question': 'Complete the pair: "Question and..."', 'answer': 'Answer', 'options': ['Answer', 'Reply', 'Response', 'Solution']},
                {'question': 'Complete the pair: "Problem and..."', 'answer': 'Solution', 'options': ['Solution', 'Answer', 'Fix', 'Cure']}
            ]
        }
    }
    
    category_questions = questions.get(category, questions['synonyms'])
    level_questions = category_questions.get(level, category_questions[1])
    question = random.choice(level_questions)
    
    return {
        'question': question['question'],
        'answer': question['answer'],
        'options': question['options'],
        'category': category,
        'level': level
    }


def generate_puzzle_question(puzzle_type: str = 'sequence', level: int = 1) -> Dict[str, Any]:
    """
    Generate a puzzle question based on type and level
    """
    puzzles = {
        'sequence': {
            1: [
                {'question': 'Complete the sequence: 2, 4, 6, 8, ?', 'answer': '10', 'hint': 'Add 2 each time'},
                {'question': 'Complete the sequence: 1, 3, 5, 7, ?', 'answer': '9', 'hint': 'Add 2 each time'},
                {'question': 'Complete the sequence: 5, 10, 15, 20, ?', 'answer': '25', 'hint': 'Add 5 each time'}
            ],
            2: [
                {'question': 'Complete the sequence: 1, 2, 4, 7, ?', 'answer': '11', 'hint': 'Add 1, then 2, then 3, then 4'},
                {'question': 'Complete the sequence: 2, 6, 12, 20, ?', 'answer': '30', 'hint': 'Add 4, then 6, then 8, then 10'},
                {'question': 'Complete the sequence: 1, 4, 9, 16, ?', 'answer': '25', 'hint': 'Square numbers: 1², 2², 3², 4², 5²'}
            ],
            3: [
                {'question': 'Complete the sequence: 1, 1, 2, 3, 5, ?', 'answer': '8', 'hint': 'Fibonacci sequence: each number is the sum of the two before it'},
                {'question': 'Complete the sequence: 2, 6, 18, 54, ?', 'answer': '162', 'hint': 'Multiply by 3 each time'},
                {'question': 'Complete the sequence: 1, 3, 6, 10, ?', 'answer': '15', 'hint': 'Add 2, then 3, then 4, then 5'}
            ]
        },
        'logic': {
            1: [
                {'question': 'If all roses are flowers and some flowers are red, then:', 'answer': 'Some roses might be red', 'hint': 'Think about logical relationships'},
                {'question': 'A clock shows 3:15. What angle is between the hands?', 'answer': '7.5 degrees', 'hint': 'Hour hand moves 0.5° per minute'},
                {'question': 'If 5 machines take 5 minutes to make 5 widgets, how long for 100 machines to make 100 widgets?', 'answer': '5 minutes', 'hint': 'Each machine makes 1 widget in 5 minutes'}
            ],
            2: [
                {'question': 'A train leaves at 2:30 PM and arrives at 5:45 PM. How long was the journey?', 'answer': '3 hours 15 minutes', 'hint': 'Calculate the time difference'},
                {'question': 'If you have 3 red balls and 4 blue balls, what\'s the probability of picking a red ball?', 'answer': '3/7', 'hint': 'Total balls = 7, red balls = 3'},
                {'question': 'A rectangle has perimeter 20 and area 24. What are its dimensions?', 'answer': '6 and 4', 'hint': 'Use the formulas P=2(l+w) and A=l×w'}
            ],
            3: [
                {'question': 'In a group of 100 people, 70 speak English, 45 speak French, and 25 speak both. How many speak neither?', 'answer': '10', 'hint': 'Use the principle of inclusion-exclusion'},
                {'question': 'A cube is painted and cut into 27 smaller cubes. How many have exactly 2 painted faces?', 'answer': '12', 'hint': 'These are the edge cubes (not corners or centers)'},
                {'question': 'If a clock loses 2 minutes every hour, how many hours until it shows the correct time again?', 'answer': '30 hours', 'hint': 'It needs to lose 12 hours (720 minutes)'}
            ]
        },
        'pattern': {
            1: [
                {'question': 'What comes next: Circle, Square, Triangle, Circle, Square, ?', 'answer': 'Triangle', 'hint': 'Look for the repeating pattern'},
                {'question': 'What comes next: Red, Blue, Green, Red, Blue, ?', 'answer': 'Green', 'hint': 'Colors repeat in the same order'},
                {'question': 'What comes next: Up, Down, Left, Right, Up, ?', 'answer': 'Down', 'hint': 'Directions cycle in a pattern'}
            ],
            2: [
                {'question': 'What comes next: A, B, C, D, A, B, C, ?', 'answer': 'D', 'hint': 'Letters repeat in groups of 4'},
                {'question': 'What comes next: 1, 2, 3, 1, 2, 3, 1, ?', 'answer': '2', 'hint': 'Numbers repeat in groups of 3'},
                {'question': 'What comes next: Star, Moon, Sun, Star, Moon, ?', 'answer': 'Sun', 'hint': 'Celestial bodies repeat in order'}
            ],
            3: [
                {'question': 'What comes next: North, East, South, West, North, East, ?', 'answer': 'South', 'hint': 'Compass directions in order'},
                {'question': 'What comes next: Spring, Summer, Fall, Winter, Spring, ?', 'answer': 'Summer', 'hint': 'Seasons repeat in order'},
                {'question': 'What comes next: Monday, Tuesday, Wednesday, Monday, Tuesday, ?', 'answer': 'Wednesday', 'hint': 'Weekdays repeat in order'}
            ]
        },
        'riddle': {
            1: [
                {'question': 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', 'answer': 'Echo', 'hint': 'Think about sound bouncing back'},
                {'question': 'What has keys, but no locks; space, but no room; and you can enter, but not go in?', 'answer': 'Keyboard', 'hint': 'You use this to type'},
                {'question': 'What gets wetter and wetter the more it dries?', 'answer': 'Towel', 'hint': 'You use this after bathing'}
            ],
            2: [
                {'question': 'The more you take, the more you leave behind. What am I?', 'answer': 'Footsteps', 'hint': 'You make these when you walk'},
                {'question': 'What has cities, but no houses; forests, but no trees; and rivers, but no water?', 'answer': 'Map', 'hint': 'This shows you where things are'},
                {'question': 'What breaks when you say it?', 'answer': 'Silence', 'hint': 'Think about what happens when you speak'}
            ],
            3: [
                {'question': 'What comes once in a minute, twice in a moment, but never in a thousand years?', 'answer': 'Letter M', 'hint': 'Look at the spelling of these words'},
                {'question': 'What has legs, but cannot walk?', 'answer': 'Table', 'hint': 'This furniture has four legs'},
                {'question': 'What can travel around the world while sitting in a corner?', 'answer': 'Stamp', 'hint': 'This goes on letters and envelopes'}
            ]
        }
    }
    
    type_puzzles = puzzles.get(puzzle_type, puzzles['sequence'])
    level_puzzles = type_puzzles.get(level, type_puzzles[1])
    puzzle = random.choice(level_puzzles)
    
    return {
        'question': puzzle['question'],
        'answer': puzzle['answer'],
        'hint': puzzle['hint'],
        'type': puzzle_type,
        'level': level
    }
