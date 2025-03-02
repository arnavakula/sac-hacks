# import os
# import re
# import json
# from openai import OpenAI

# def read_file(file_path):
#     """Read content from a file."""
#     with open(file_path, 'r', encoding='utf-8') as file:
#         return file.read()

# def write_file(file_path, content):
#     """Write content to a file."""
#     with open(file_path, 'w', encoding='utf-8') as file:
#         file.write(content)

# def parse_professor_file(content):
#     """Parse the professor's file with questions, answers, and points."""
#     # Extract questions and their point values
#     questions = []
    
#     # Match question sections
#     question_pattern = r'### Question (\d+): (.*?) \((\d+) points\)(.*?)(?=### Question \d+:|$)'
#     question_matches = re.findall(question_pattern, content, re.DOTALL)
    
#     for match in question_matches:
#         q_num, q_title, points, q_content = match
        
#         # Extract the solution part from the question content
#         solution_pattern = r'Solution:(.*?)(?=\n\n|$)'
#         solution_match = re.search(solution_pattern, q_content, re.DOTALL)
        
#         solution = ""
#         if solution_match:
#             solution = solution_match.group(1).strip()
#         else:
#             # If no explicit "Solution:" marker, use the content after the question
#             solution = q_content.strip()
        
#         questions.append({
#             'number': int(q_num),
#             'title': q_title.strip(),
#             'points': int(points),
#             'solution': solution
#         })
    
#     return questions

# def parse_student_file(content):
#     """Parse the student's file with answers."""
#     # Extract student information
#     student_info = {}
#     name_match = re.search(r'Name: (.*?)$', content, re.MULTILINE)
#     id_match = re.search(r'Student ID Number: (\d+)', content)
    
#     if name_match:
#         student_info['name'] = name_match.group(1).strip()
#     if id_match:
#         student_info['id'] = id_match.group(1).strip()
    
#     # Extract problems and answers
#     problems = []
#     # Match problem sections
#     problem_pattern = r'### Question (\d+): (.*?) \((\d+) points\)(.*?)(?=### Question \d+:|$)'
#     problem_matches = re.findall(problem_pattern, content, re.DOTALL)
    
#     for match in problem_matches:
#         p_num, q_title, points, p_content = match
#         problems.append({
#             'number': int(p_num),
#             'points': int(points),
#             'answer': p_content.strip()
#         })
    
#     return student_info, problems

# def compare_answers(student_answer, professor_solution, question_title, max_points, client):
#     """Compare student and professor answers using OpenAI API."""
#     prompt = f"""
#     I need to grade a student's answer to an exam question. 
    
#     Question {question_title}
    
#     Professor's solution (correct answer):
#     {professor_solution}
    
#     Student's answer:
#     {student_answer}
    
#     Maximum points: {max_points}
    
#     Please evaluate the student's answer in comparison to the professor's solution.
#     Consider:
#     1. Accuracy of content
#     2. Completeness of the answer
#     3. Key concepts demonstrated
#     4. Logical reasoning and approach
    
#     Return a JSON object with the following fields:
#     1. "score": The numeric score (from 0 to {max_points})
#     2. "feedback": Brief explanation of the score and what was correct, missing, or incorrect
#     3. "correct_points": The specific aspects that were correct in the student's answer
#     4. "missing_points": The key aspects that were missing or incorrect
    
#     Format your response as a valid JSON object only, with no additional text.
#     """
    
#     response = client.chat.completions.create(
#         model="gpt-4-turbo",
#         messages=[
#             {"role": "system", "content": "You are an expert grading assistant with experience in computer science, mathematics, and logic."},
#             {"role": "user", "content": prompt}
#         ],
#         response_format={"type": "json_object"}
#     )
    
#     try:
#         result = json.loads(response.choices[0].message.content)
#         return result
#     except json.JSONDecodeError:
#         # Fallback if the API doesn't return proper JSON
#         return {
#             "score": 0,
#             "feedback": "Error processing this answer. Please review manually.",
#             "correct_points": [],
#             "missing_points": ["Unable to process"]
#         }

# def generate_graded_file(student_file_path, professor_file_path, output_file_path, api_key):
#     """Generate a graded file with scores and feedback."""
#     client = OpenAI(api_key=api_key)
    
#     # Read and parse the files
#     student_content = read_file(student_file_path)
#     professor_content = read_file(professor_file_path)
    
#     professor_questions = parse_professor_file(professor_content)
#     student_info, student_problems = parse_student_file(student_content)
    
#     # Begin building the output content
#     output_content = "# GRADED EXAM\n\n"
    
#     if student_info:
#         output_content += f"## Student Information\n"
#         for key, value in student_info.items():
#             output_content += f"- {key.capitalize()}: {value}\n"
#         output_content += "\n"
    
#     total_score = 0
#     total_possible = 0
    
#     # Process each question
#     for prof_question in professor_questions:
#         q_num = prof_question['number']
        
#         # Find matching student problem
#         student_problem = next((p for p in student_problems if p['number'] == q_num), None)
        
#         output_content += f"## Question {q_num}: {prof_question['title']} ({prof_question['points']} points)\n\n"
        
#         if student_problem:
#             # Grade the answer
#             evaluation = compare_answers(
#                 student_problem['answer'],
#                 prof_question['solution'],
#                 prof_question['title'],
#                 prof_question['points'],
#                 client
#             )
            
#             # Update scores
#             score = evaluation['score']
#             total_score += score
#             total_possible += prof_question['points']
            
#             # Format the output
#             output_content += f"### Student Answer\n{student_problem['answer']}\n\n"
#             output_content += f"### Professor Solution\n{prof_question['solution']}\n\n"
#             output_content += f"### Score: {score}/{prof_question['points']}\n\n"
#             output_content += f"### Feedback\n{evaluation['feedback']}\n\n"
            
#             output_content += "#### Correct Points\n"
#             for point in evaluation.get('correct_points', []):
#                 output_content += f"- {point}\n"
            
#             output_content += "\n#### Missing/Incorrect Points\n"
#             for point in evaluation.get('missing_points', []):
#                 output_content += f"- {point}\n"
            
#         else:
#             output_content += "### Student Answer\n[NO ANSWER PROVIDED]\n\n"
#             output_content += f"### Professor Solution\n{prof_question['solution']}\n\n"
#             output_content += f"### Score: 0/{prof_question['points']}\n\n"
#             output_content += "### Feedback\nNo answer provided.\n\n"
            
#             total_possible += prof_question['points']
        
#         output_content += "\n" + "-"*50 + "\n\n"
    
#     # Add summary at the end
#     if total_possible > 0:
#         percentage = (total_score / total_possible) * 100
#         output_content += f"## FINAL SCORE: {total_score}/{total_possible} ({percentage:.2f}%)\n"
#     else:
#         output_content += f"## FINAL SCORE: {total_score}/{total_possible} (0.00%)\n"
    
#     # Write to output file
#     write_file(output_file_path, output_content)
    
#     return {
#         "score": total_score,
#         "possible": total_possible,
#         "percentage": (total_score / total_possible) * 100 if total_possible > 0 else 0
#     }

# def main():
#     # Get API key from environment variable for security
#     api_key = "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"
    
    
#     # File paths
#     student_file = "/Users/krishnagupta/Desktop/sac-hacks/structured_response_que.txt"
#     professor_file = "/Users/krishnagupta/Desktop/sac-hacks/structured_response_answer-2.txt"
#     output_file = "/Users/krishnagupta/Desktop/sac-hacks/graded_student_response.txt"
    
#     # Check if files exist
#     if not os.path.exists(student_file):
#         print(f"Error: Student file '{student_file}' does not exist.")
#         return
    
#     if not os.path.exists(professor_file):
#         print(f"Error: Professor file '{professor_file}' does not exist.")
#         return
    
#     print("\nProcessing files... This may take a moment as each question is evaluated.")
    
#     # Generate graded file
#     try:
#         result = generate_graded_file(student_file, professor_file, output_file, api_key)
#         print(f"\nGrading complete! Final score: {result['score']}/{result['possible']} ({result['percentage']:.2f}%)")
#         print(f"Graded file saved to: {output_file}")
#     except Exception as e:
#         print(f"An error occurred during grading: {str(e)}")
#         import traceback
#         traceback.print_exc()

# if __name__ == "__main__":
#     main()



import os
import re
import json
from flask import Flask, request, render_template_string, redirect, url_for, flash
from openai import OpenAI

app = Flask(__name__)
app.secret_key = "/Users/krishnagupta/Desktop/sac-hacks/crypto-minutia-452500-r2-89f3fb690209.json"

STUDENT_FILE = "/Users/krishnagupta/Desktop/sac-hacks/structured_response_que.txt"
PROFESSOR_FILE = "/Users/krishnagupta/Desktop/sac-hacks/structured_response_answer-2.txt"
OUTPUT_FILE = "/Users/krishnagupta/Desktop/sac-hacks/graded_student_response.txt"
API_KEY ="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"

def read_file(file_path):
    """Read content from a file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def write_file(file_path, content):
    """Write content to a file."""
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def parse_professor_file(content):
    """Parse the professor's file with questions, answers, and points."""
    questions = []
    question_pattern = r'### Question (\d+): (.*?) \((\d+) points\)(.*?)(?=### Question \d+:|$)'
    question_matches = re.findall(question_pattern, content, re.DOTALL)
    
    for match in question_matches:
        q_num, q_title, points, q_content = match
        solution_pattern = r'Solution:(.*?)(?=\n\n|$)'
        solution_match = re.search(solution_pattern, q_content, re.DOTALL)
        
        solution = ""
        if solution_match:
            solution = solution_match.group(1).strip()
        else:
            solution = q_content.strip()
        
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
    Consider:
    1. Accuracy of content
    2. Completeness of the answer
    3. Key concepts demonstrated
    4. Logical reasoning and approach
    
    Return a JSON object with the following fields:
    1. "score": The numeric score (from 0 to {max_points})
    2. "feedback": Brief explanation of the score and what was correct, missing, or incorrect
    3. "correct_points": The specific aspects that were correct in the student's answer
    4. "missing_points": The key aspects that were missing or incorrect
    
    Format your response as a valid JSON object only, with no additional text.
    """
    
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are an expert grading assistant with experience in computer science, mathematics, and logic."},
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

def generate_graded_file(student_file_path, professor_file_path, output_file_path, api_key):
    """Generate a graded file with scores and feedback."""
    client = OpenAI(api_key=api_key)
    
    student_content = read_file(student_file_path)
    professor_content = read_file(professor_file_path)
    
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
    
    for prof_question in professor_questions:
        q_num = prof_question['number']
        student_problem = next((p for p in student_problems if p['number'] == q_num), None)
        output_content += f"## Question {q_num}: {prof_question['title']} ({prof_question['points']} points)\n\n"
        
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
            
            output_content += f"### Student Answer\n{student_problem['answer']}\n\n"
            output_content += f"### Professor Solution\n{prof_question['solution']}\n\n"
            output_content += f"### Score: {score}/{prof_question['points']}\n\n"
            output_content += f"### Feedback\n{evaluation['feedback']}\n\n"
            
            # output_content += "#### Correct Points\n"
            # for point in evaluation.get('correct_points', []):
            #     output_content += f"- {point}\n"
            # output_content += "\n#### Missing/Incorrect Points\n"
            # for point in evaluation.get('missing_points', []):
            #     output_content += f"- {point}\n"
        else:
            output_content += "### Student Answer\n[NO ANSWER PROVIDED]\n\n"
            output_content += f"### Professor Solution\n{prof_question['solution']}\n\n"
            output_content += f"### Score: 0/{prof_question['points']}\n\n"
            output_content += "### Feedback\nNo answer provided.\n\n"
            total_possible += prof_question['points']
        
        output_content += "\n" + "-"*50 + "\n\n"
    
    if total_possible > 0:
        percentage = (total_score / total_possible) * 100
        output_content += f"## FINAL SCORE: {total_score}/{total_possible} ({percentage:.2f}%)\n"
    else:
        output_content += "## FINAL SCORE: 0/0 (0.00%)\n"
    
    write_file(output_file_path, output_content)
    
    return {
        "score": total_score,
        "possible": total_possible,
        "percentage": (total_score / total_possible) * 100 if total_possible > 0 else 0
    }

# HTML template for the submission page
HTML_TEMPLATE = """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Grading Submission</title>
  </head>
  <body>
    <h1>Grading Submission</h1>
    <form method="POST" action="/submit">
      <button type="submit">Submit for Grading</button>
    </form>
    {% with messages = get_flashed_messages() %}
      {% if messages %}
        <ul>
          {% for message in messages %}
            <li>{{ message }}</li>
          {% endfor %}
        </ul>
      {% endif %}
    {% endwith %}
    {% if score is defined %}
      <h2>Grading Complete!</h2>
      <p>Final Score: {{ score }}/{{ possible }} ({{ percentage }}%)</p>
      <p>Check the output file: {{ output_file }}</p>
    {% endif %}
  </body>
</html>
"""

@app.route("/", methods=["GET"])
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route("/submit", methods=["POST"])
def submit():
    try:
        result = generate_graded_file(STUDENT_FILE, PROFESSOR_FILE, OUTPUT_FILE, API_KEY)
        flash("Grading complete!")
        return render_template_string(
            HTML_TEMPLATE,
            score=result["score"],
            possible=result["possible"],
            percentage=f"{result['percentage']:.2f}",
            output_file=OUTPUT_FILE
        )
    except Exception as e:
        flash(f"An error occurred during grading: {str(e)}")
        return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True,port=5005)