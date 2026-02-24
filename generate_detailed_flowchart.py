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
    node [shape=box, style=filled, fillcolor="#1E293B", color="#3B82F6", fontcolor=white, penwidth=2, fontname="Helvetica", margin=0.2];
    edge [color="#475569", penwidth=2, fontname="Helvetica", fontcolor="#333333", fontsize=10];
    rankdir=TB; /* Top to Bottom */
    bgcolor="white";
    nodesep=0.5; /* Horizontal spacing */
    ranksep=0.8; /* Vertical spacing */
    
    Start [label="Start: User visits IntelliRisk", shape=rect, style="rounded,filled", fillcolor="#3B82F6"];
    Login [label="Enter Email & Password", shape=rect];
    Start -> Login;
    
    AuthCheck [label="Authentication Check", shape=diamond, fillcolor="#3B82F6", height=1.2];
    Login -> AuthCheck [label=" Submit credentials"];
    
    AuthFail [label="Show Error: Invalid Credentials", shape=rect, fillcolor="#EF4444", color="#991B1B"];
    AuthCheck -> AuthFail [label=" Invalid"];
    AuthFail -> Login [label=" Retry"];
    
    RoleRouting [label="Route based on Role", shape=diamond, fillcolor="#3B82F6", height=1.2];
    AuthCheck -> RoleRouting [label=" Valid"];
    
    /* ================= STUDENT PATH ================= */
    StudentStart [label="Load Student Portal", style="rounded,filled", fillcolor="#10B981", color="#047857"];
    RoleRouting -> StudentStart [label=" Role == Student"];
    
    SDash [label="View Overview Dashboard", fillcolor="#10B981"];
    SFetchDash [label="Fetch Dashboard Data from Backend"];
    SShowDash [label="Display: Health Score, Active Subjects,\\nRecent Test Averages"];
    StudentStart -> SDash;
    SDash -> SFetchDash -> SShowDash;
    
    SMenu [label="Navigate Sidebar Menu", shape=diamond, fillcolor="#10B981"];
    SShowDash -> SMenu;
    
    /* Student Menu Paths */
    SAtt [label="Click 'My Attendance'", fillcolor="#10B981"];
    SAttFetch [label="Fetch Daily Attendance Records"];
    SAttShow [label="Render Monthly Calendar\\n(Green=Present, Red=Absent)\\nRender Health Growth Area Chart"];
    SMenu -> SAtt; SAtt -> SAttFetch -> SAttShow;
    
    SSub [label="Click 'My Subjects Analysis'", fillcolor="#10B981"];
    SSubFetch [label="Fetch Class Rankings\\n(Mask other students for privacy)"];
    SSubShow [label="Render Subject Rankings Table\\n(Math, CT, DE, C++)"];
    SMenu -> SSub; SSub -> SSubFetch -> SSubShow;
    
    STest [label="Click 'Tests & Quizzes'", fillcolor="#10B981"];
    STestFetch [label="Fetch Past Exam Scores\\n& Instructor Feedback"];
    STestShow [label="Render Composite Score\\n& Feedback List"];
    SMenu -> STest; STest -> STestFetch -> STestShow;
    
    SProj [label="Click 'Skill Projects'", fillcolor="#10B981"];
    SProjForm [label="Fill Project Details & File URI"];
    SProjSubmit [label="Submit Project to Admin Database"];
    SMenu -> SProj; SProj -> SProjForm -> SProjSubmit;
    
    SPred [label="Click 'Success Intelligence'", fillcolor="#10B981"];
    SPredFetch [label="Fetch ML Predictions\\nfrom Flask (/predict) API"];
    SPredShow [label="Render Radar Chart, Risk Warnings,\\n& Probability of Success"];
    SMenu -> SPred; SPred -> SPredFetch -> SPredShow;
    
    SMenuBack [label="Return to Navigation"];
    SAttShow -> SMenuBack; SSubShow -> SMenuBack; STestShow -> SMenuBack; SProjSubmit -> SMenuBack; SPredShow -> SMenuBack;
    SMenuBack -> SMenu;

    /* ================= ADMIN PATH ================= */
    AdminStart [label="Load Admin Portal", style="rounded,filled", fillcolor="#8B5CF6", color="#6D28D9"];
    RoleRouting -> AdminStart [label=" Role == Admin"];
    
    ADash [label="View Global Dashboard", fillcolor="#8B5CF6"];
    AFetchDash [label="Fetch Aggregated Institutional Data"];
    AShowDash [label="Display Overview: Total Students,\\nAvg Institutional Health"];
    AdminStart -> ADash;
    ADash -> AFetchDash -> AShowDash;
    
    AMenu [label="Navigate Sidebar Menu", shape=diamond, fillcolor="#8B5CF6"];
    AShowDash -> AMenu;
    
    /* Admin Menu Paths */
    AAtt [label="Click 'Class Attendance'", fillcolor="#8B5CF6"];
    AAttFetch [label="Fetch All Student Profiles"];
    AAttList [label="Render Master Student List Table"];
    AAttClick [label="Click Specific Student Row"];
    AAttDetail [label="Render Deep-Dive Academic Profile\\n(Dynamic Health Chart\\n& Subject Breakdowns)"];
    AMenu -> AAtt; AAtt -> AAttFetch -> AAttList -> AAttClick -> AAttDetail;
    
    ASub [label="Click 'Class Subjects'", fillcolor="#8B5CF6"];
    ASubFetch [label="Fetch Uncensored Class Rankings"];
    ASubShow [label="Render Full Global Leaderboard"];
    AMenu -> ASub; ASub -> ASubFetch -> ASubShow;
    
    ATest [label="Click 'Class Tests'", fillcolor="#8B5CF6"];
    ATestFetch [label="Fetch All Exams & Instructor Notes"];
    ATestShow [label="Render Global Exam Archive"];
    AMenu -> ATest; ATest -> ATestFetch -> ATestShow;
    
    AProj [label="Click 'Class Projects'", fillcolor="#8B5CF6"];
    AProjFetch [label="Fetch Submitted Projects Database"];
    AProjExpand [label="Expand Row for Specific Student"];
    AProjShow [label="Review Project Files & Details"];
    AMenu -> AProj; AProj -> AProjFetch -> AProjExpand -> AProjShow;
    
    APred [label="Click 'Class Intelligence'", fillcolor="#8B5CF6"];
    APredFetch [label="Fetch Batch ML Classifications\\nfrom Flask (/predict_all)"];
    APredShow [label="Render Institution Risk Dashboard\\n& At-Risk Student Roster"];
    AMenu -> APred; APred -> APredFetch -> APredShow;
    
    AMenuBack [label="Return to Navigation"];
    AAttDetail -> AMenuBack; ASubShow -> AMenuBack; ATestShow -> AMenuBack; AProjShow -> AMenuBack; APredShow -> AMenuBack;
    AMenuBack -> AMenu;
}
"""

# Fetch PNG from QuickChart
url = "https://quickchart.io/graphviz?format=png&graph=" + urllib.parse.quote(dot_code)
png_path = os.path.join(os.path.dirname(__file__), "temp_detailed_flowchart.png")
jpg_path = os.path.join(os.path.dirname(__file__), "IntelliRisk_Detailed_Flowchart.jpg")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    print("Requesting highly detailed PNG from QuickChart...")
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
