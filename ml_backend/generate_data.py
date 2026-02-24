import pandas as pd
import numpy as np
import random

def generate_synthetic_data(num_samples=1000):
    first_names = ["Rahul", "Priya", "Amit", "Sneha", "Karan", "Pooja", "Vikram", "Riya", "Arjun", "Neha", 
                   "Mitul", "Sabereesh", "Ajay", "Pennesh", "Pradhik", "Kavinaya", "Balkies", "Siva", "Vijay", "Ajith"]
    
    data = []
    
    for i in range(1, num_samples + 1):
        name = random.choice(first_names) + str(random.randint(1, 99))
        
        # Subject-wise attendance (classwise)
        maths_att = np.random.randint(40, 100)
        ct_att = np.random.randint(40, 100)
        de_att = np.random.randint(40, 100)
        cpp_att = np.random.randint(40, 100)
        
        # Center of Excellence (Practical) attendance
        coe_att = np.random.randint(30, 100)
        
        # Subject-wise test scores
        maths_score = np.random.randint(30, 100)
        ct_score = np.random.randint(30, 100)
        de_score = np.random.randint(30, 100)
        cpp_score = np.random.randint(30, 100)
        
        # Analyze overall metrics
        avg_att = (maths_att + ct_att + de_att + cpp_att) / 4.0
        avg_score = (maths_score + ct_score + de_score + cpp_score) / 4.0
        
        # Determine Student Profile based on new rules
        if avg_score >= 80 and avg_att >= 80 and coe_att >= 80:
            profile = "Excellent All-Rounder"
        elif avg_score < 70 and avg_att < 75 and coe_att >= 80:
            profile = "Practical Learner"
        elif avg_score >= 80 and coe_att < 60:
            profile = "Theoretical Learner"
        elif avg_score < 60 and avg_att >= 80:
            profile = "Struggling Academically"
        elif avg_score < 60 and avg_att < 60 and coe_att < 60:
            profile = "Needs Motivation"
        else:
            profile = "Inconsistent Learner"
            
        data.append([
            i, name, 
            maths_att, ct_att, de_att, cpp_att, coe_att,
            maths_score, ct_score, de_score, cpp_score, 
            profile
        ])
        
    columns = [
        "S_NO", "NAME", 
        "MATHS_ATT", "CT_ATT", "DE_ATT", "CPP_ATT", "COE_ATT",
        "MATHS_SCORE", "CT_SCORE", "DE_SCORE", "CPP_SCORE", 
        "STUDENT_PROFILE"
    ]
    df = pd.DataFrame(data, columns=columns)
    
    filepath = "../student dataset.csv"
    df.to_csv(filepath, index=False)
    print(f"✅ Successfully generated {num_samples} records globally with subject-wise features.")

if __name__ == "__main__":
    generate_synthetic_data(1000)
