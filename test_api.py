import requests
import json

base_url = "http://localhost:5000/api"

def test_summary(user_id):
    print(f"--- Testing summary for user {user_id} ---")
    try:
        r = requests.get(f"{base_url}/progress/summary?user_id={user_id}")
        if r.status_code == 200:
            data = r.json()
            print(f"User: {data.get('user')}")
            detailed = data.get('detailed_progress', [])
            print(f"Detailed logs count: {len(detailed)}")
            if detailed:
                print(f"First log: {detailed[0]['question_data'][:50]}... Result: {detailed[0]['is_correct']}")
        else:
            print(f"Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"Connection error: {e}")

test_summary(1)
test_summary(2)
