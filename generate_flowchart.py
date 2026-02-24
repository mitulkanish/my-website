import urllib.request
import urllib.parse
import os
import subprocess
import sys

# Ensure pillow is installed
try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

dot_code = """
digraph G {
    node [shape=box, style=filled, fillcolor="#1E293B", color="#3B82F6", fontcolor=white, penwidth=2, fontname="Helvetica"];
    edge [color="#475569", penwidth=2, fontname="Helvetica", fontcolor="#333333"];
    rankdir=TD;
    bgcolor="white";
    
    Start [label="User Arrives", shape=ellipse, fillcolor="#3B82F6"];
    Login [label="Login System", shape=diamond, fillcolor="#3B82F6"];
    Start -> Login;
    
    RoleCheck [label="Role?", shape=diamond, fillcolor="#3B82F6"];
    Login -> RoleCheck;
    
    StudentDash [label="Student Dashboard", fillcolor="#10B981", color="#047857", fontcolor=white];
    AdminDash [label="Admin Dashboard", fillcolor="#8B5CF6", color="#6D28D9", fontcolor=white];
    
    RoleCheck -> StudentDash [label=" Student"];
    RoleCheck -> AdminDash [label=" Admin"];
    
    S1 [label="Dashboard Overview"];
    S2 [label="My Attendance"];
    S3 [label="My Subjects Analysis"];
    S4 [label="Tests & Quizzes"];
    S5 [label="Skill Projects"];
    S6 [label="Success Intelligence"];
    
    StudentDash -> S1;
    StudentDash -> S2;
    StudentDash -> S3;
    StudentDash -> S4;
    StudentDash -> S5;
    StudentDash -> S6;
    
    A1 [label="Global Dashboard"];
    A2 [label="Class Attendance & Profiles"];
    A3 [label="Class Subjects Analysis"];
    A4 [label="Class Tests & Quizzes"];
    A5 [label="Class Skill Projects"];
    A6 [label="Class Intelligence"];
    
    AdminDash -> A1;
    AdminDash -> A2;
    AdminDash -> A3;
    AdminDash -> A4;
    AdminDash -> A5;
    AdminDash -> A6;
}
"""

# Fetch PNG from QuickChart
url = "https://quickchart.io/graphviz?format=png&graph=" + urllib.parse.quote(dot_code)
png_path = os.path.join(os.path.dirname(__file__), "temp_flowchart.png")
jpg_path = os.path.join(os.path.dirname(__file__), "IntelliRisk_Flowchart.jpg")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    print("Requesting PNG from QuickChart...")
    with urllib.request.urlopen(req) as response:
        with open(png_path, 'wb') as f:
            f.write(response.read())
    
    print("Converting PNG to JPG...")
    img = Image.open(png_path)
    # Convert to RGB if it has alpha channel
    if img.mode in ('RGBA', 'LA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3]) # 3 is the alpha channel
        background.save(jpg_path, 'JPEG', quality=95)
    else:
        img.convert('RGB').save(jpg_path, 'JPEG', quality=95)
        
    img.close()
    if os.path.exists(png_path):
        os.remove(png_path)
        
    print(f"Successfully saved {jpg_path}")
except Exception as e:
    print(f"Error: {e}")
