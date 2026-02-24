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
    node [shape=box, style="rounded,filled", fontname="Helvetica", margin=0.2, penwidth=1];
    edge [color="#64748B", penwidth=2, fontname="Helvetica", fontcolor="#475569", fontsize=10];
    rankdir=LR;
    nodesep=0.4;
    ranksep=0.8;
    bgcolor="white";
    splines=ortho;
    
    Start [label="Start User Session", fillcolor="#3B82F6", color="#2563EB", fontcolor=white, shape=ellipse];
    Login [label="Enter Credentials", fillcolor="#F1F5F9", color="#CBD5E1"];
    AuthCheck [label="Authentication", shape=diamond, fillcolor="#F1F5F9", color="#CBD5E1"];
    
    Start -> Login -> AuthCheck;
    
    subgraph cluster_Student {
        label = "Student Portal";
        style=dashed;
        color="#10B981";
        fontcolor="#047857";
        fontname="Helvetica-Bold";
        margin=20;
        
        SDash [label="Dashboard Overview", fillcolor="#10B981", color="#047857", fontcolor=white];
        SAtt [label="My Attendance", fillcolor="#D1FAE5", color="#10B981"];
        SSub [label="My Subjects Analysis", fillcolor="#D1FAE5", color="#10B981"];
        STest [label="Tests & Quizzes", fillcolor="#D1FAE5", color="#10B981"];
        SProj [label="Skill Projects", fillcolor="#D1FAE5", color="#10B981"];
        SPred [label="Success Intelligence", fillcolor="#D1FAE5", color="#10B981"];
        
        SAttFetch [label="Fetch Daily Recs", fillcolor="white", color="#10B981"];
        SSubFetch [label="Fetch & Filter Rank", fillcolor="white", color="#10B981"];
        STestFetch [label="Fetch Exam Hist.", fillcolor="white", color="#10B981"];
        SProjUpload [label="Upload Project File", fillcolor="white", color="#10B981"];
        SPredFetch [label="Fetch ML Predict", fillcolor="white", color="#10B981"];
        
        SAttShow [label="Render Cal & Grid", fillcolor="#F1F5F9", color="#94A3B8"];
        SSubShow [label="Render Rankings", fillcolor="#F1F5F9", color="#94A3B8"];
        STestShow [label="Render Feedbacks", fillcolor="#F1F5F9", color="#94A3B8"];
        SPredShow [label="Render Risk Warnings", fillcolor="#F1F5F9", color="#94A3B8"];
        
        SDash -> SAtt; SDash -> SSub; SDash -> STest; SDash -> SProj; SDash -> SPred;
        
        SAtt -> SAttFetch -> SAttShow;
        SSub -> SSubFetch -> SSubShow;
        STest -> STestFetch -> STestShow;
        SProj -> SProjUpload;
        SPred -> SPredFetch -> SPredShow;
    }
    
    subgraph cluster_Admin {
        label = "Administrator Portal";
        style=dashed;
        color="#8B5CF6";
        fontcolor="#6D28D9";
        fontname="Helvetica-Bold";
        margin=20;
        
        ADash [label="Global Dashboard", fillcolor="#8B5CF6", color="#6D28D9", fontcolor=white];
        AAtt [label="Class Attendance", fillcolor="#EDE9FE", color="#8B5CF6"];
        ASub [label="Class Subjects", fillcolor="#EDE9FE", color="#8B5CF6"];
        ATest [label="Class Tests", fillcolor="#EDE9FE", color="#8B5CF6"];
        AProj [label="Class Projects", fillcolor="#EDE9FE", color="#8B5CF6"];
        APred [label="Class Intelligence", fillcolor="#EDE9FE", color="#8B5CF6"];
        
        AAttFetch [label="Fetch All Students", fillcolor="white", color="#8B5CF6"];
        ASubFetch [label="Fetch Full Rankings", fillcolor="white", color="#8B5CF6"];
        ATestFetch [label="Fetch All Exams", fillcolor="white", color="#8B5CF6"];
        AProjFetch [label="Fetch All Projects", fillcolor="white", color="#8B5CF6"];
        APredFetch [label="Fetch Batch ML", fillcolor="white", color="#8B5CF6"];
        
        AAttShow [label="Render Indv. Profiles", fillcolor="#F1F5F9", color="#94A3B8"];
        ASubShow [label="Render Global Board", fillcolor="#F1F5F9", color="#94A3B8"];
        ATestShow [label="Render Exam Archive", fillcolor="#F1F5F9", color="#94A3B8"];
        AProjShow [label="Review File Uploads", fillcolor="#F1F5F9", color="#94A3B8"];
        APredShow [label="Render At-Risk Roster", fillcolor="#F1F5F9", color="#94A3B8"];
        
        ADash -> AAtt; ADash -> ASub; ADash -> ATest; ADash -> AProj; ADash -> APred;
        
        AAtt -> AAttFetch -> AAttShow;
        ASub -> ASubFetch -> ASubShow;
        ATest -> ATestFetch -> ATestShow;
        AProj -> AProjFetch -> AProjShow;
        APred -> APredFetch -> APredShow;
    }

    AuthCheck -> SDash [label=" If Student"];
    AuthCheck -> ADash [label=" If Admin"];
}
"""

# Fetch PNG from QuickChart
url = "https://quickchart.io/graphviz?format=png&graph=" + urllib.parse.quote(dot_code)
png_path = os.path.join(os.path.dirname(__file__), "temp_clean_flowchart.png")
jpg_path = os.path.join(os.path.dirname(__file__), "IntelliRisk_Clean_Flowchart.jpg")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    print("Requesting highly detailed orthogonal PNG from QuickChart...")
    with urllib.request.urlopen(req) as response:
        with open(png_path, 'wb') as f:
            f.write(response.read())
    
    print("Converting PNG to JPG...")
    img = Image.open(png_path)
    # Convert to RGB if it has alpha channel
    if img.mode in ('RGBA', 'LA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        background.save(jpg_path, 'JPEG', quality=100)
    else:
        img.convert('RGB').save(jpg_path, 'JPEG', quality=100)
        
    img.close()
    if os.path.exists(png_path):
        os.remove(png_path)
        
    print(f"Successfully saved {jpg_path}")
except Exception as e:
    print(f"Error: {e}")
