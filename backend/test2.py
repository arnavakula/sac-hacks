

import os
import re
import json
import requests  # ✅ Used to fetch files from URLs
from flask import Flask, request, jsonify
from openai import OpenAI

app = Flask(__name__)

API_KEY ="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"
app.secret_key = "/Users/arnavakula/Code/hackathons/sac-hacks/backend/crypto-minutia-452500-r2-89f3fb690209.json"

def fetch_file_content(url):
    """Fetch file content from a given URL."""
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error if request fails
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching file from {url}: {e}")
        return None

def parse_professor_file(content):
    """Parse the professor's file with questions, answers, and points."""
    questions = []
    question_pattern = r'### Question (\d+): (.*?) \((\d+) points\)(.*?)(?=### Question \d+:|$)'
    question_matches = re.findall(question_pattern, content, re.DOTALL)
    
    for match in question_matches:
        q_num, q_title, points, q_content = match
        solution_pattern = r'Solution:(.*?)(?=\n\n|$)'
        solution_match = re.search(solution_pattern, q_content, re.DOTALL)
        
        solution = solution_match.group(1).strip() if solution_match else q_content.strip()
        
        questions.append({
            'number': int(q_num),
            'title': q_title.strip(),
            'points': int(points),
            'solution': solution
        })
    
    return questions

def parse_student_file(content):
    """Parse the student's file with answers."""
    student_info = {}
    name_match = re.search(r'Name: (.*?)$', content, re.MULTILINE)
    id_match = re.search(r'Student ID Number: (\d+)', content)
    
    if name_match:
        student_info['name'] = name_match.group(1).strip()
    if id_match:
        student_info['id'] = id_match.group(1).strip()
    
    problems = []
    problem_pattern = r'### Question (\d+): (.*?) \((\d+) points\)(.*?)(?=### Question \d+:|$)'
    problem_matches = re.findall(problem_pattern, content, re.DOTALL)
    
    for match in problem_matches:
        p_num, q_title, points, p_content = match
        problems.append({
            'number': int(p_num),
            'points': int(points),
            'answer': p_content.strip()
        })
    
    return student_info, problems

def compare_answers(student_answer, professor_solution, question_title, max_points, client):
    """Compare student and professor answers using OpenAI API."""
    prompt = f"""
    I need to grade a student's answer to an exam question. 
    
    Question {question_title}
    
    Professor's solution (correct answer):
    {professor_solution}
    
    Student's answer:
    {student_answer}
    
    Maximum points: {max_points}
    
    Please evaluate the student's answer in comparison to the professor's solution.
    
    Return a JSON object with:
    - "score": Numeric score (0 to {max_points})
    - "feedback": Explanation of what was correct, missing, or incorrect.
    - "correct_points": The aspects correct in the student's answer.
    - "missing_points": The key aspects missing or incorrect.
    
    Format the response as a valid JSON object only.
    """
    
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are an expert grading assistant with experience in mathematics, logic, and science."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        return result
    except json.JSONDecodeError:
        return {
            "score": 0,
            "feedback": "Error processing this answer. Please review manually.",
            "correct_points": [],
            "missing_points": ["Unable to process"]
        }

def generate_graded_file(student_url, professor_url, api_key):
    """Generate a graded file with scores and feedback."""
    client = OpenAI(api_key=api_key)
    
    # ✅ Fetch student and professor files from URLs
    student_content = fetch_file_content(student_url)
    professor_content = fetch_file_content(professor_url)
    
    if not student_content or not professor_content:
        return {"error": "Failed to fetch structured text files from URLs."}
    
    professor_questions = parse_professor_file(professor_content)
    student_info, student_problems = parse_student_file(student_content)
    
    output_content = "# GRADED EXAM\n\n"
    
    if student_info:
        output_content += "## Student Information\n"
        for key, value in student_info.items():
            output_content += f"- {key.capitalize()}: {value}\n"
        output_content += "\n"
    
    total_score = 0
    total_possible = 0
    
    graded_questions = []

    for prof_question in professor_questions:
        q_num = prof_question['number']
        student_problem = next((p for p in student_problems if p['number'] == q_num), None)

        question_result = {
            "question_number": q_num,
            "question_title": prof_question['title'],
            "max_points": prof_question['points'],
        }

        if student_problem:
            evaluation = compare_answers(
                student_problem['answer'],
                prof_question['solution'],
                prof_question['title'],
                prof_question['points'],
                client
            )
            score = evaluation['score']
            total_score += score
            total_possible += prof_question['points']

            question_result.update({
                "student_answer": student_problem['answer'],
                "professor_solution": prof_question['solution'],
                "score": score,
                "feedback": evaluation['feedback'],
            })
        else:
            question_result.update({
                "student_answer": "[NO ANSWER PROVIDED]",
                "professor_solution": prof_question['solution'],
                "score": 0,
                "feedback": "No answer provided.",
            })
            total_possible += prof_question['points']

        graded_questions.append(question_result)

    percentage = (total_score / total_possible) * 100 if total_possible > 0 else 0

    return {
        "score": total_score,
        "possible": total_possible,
        "percentage": percentage,
        "questions": graded_questions
    }

@app.route("/submit", methods=["POST"])
def submit():
    try:
        # ✅ Parse JSON request body
        data = request.get_json()
        student_url = data.get("student_url")
        professor_url = data.get("professor_url")

        if not student_url or not professor_url:
            return jsonify({"error": "Missing 'student_url' or 'professor_url' in request body"}), 400
        
        # ✅ Run grading process
        result = generate_graded_file(student_url, professor_url, API_KEY)
        
        # ✅ Return JSON response
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5005)
