import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

def train():
    print("Loading dataset...")
    df = pd.read_csv("../student dataset.csv")
    
    # Feature Selection with new columns
    features = [
        "MATHS_ATT", "CT_ATT", "DE_ATT", "CPP_ATT", "COE_ATT",
        "MATHS_SCORE", "CT_SCORE", "DE_SCORE", "CPP_SCORE"
    ]
    target = "STUDENT_PROFILE"
    
    X = df[features]
    y = df[target]
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier on subject-wise data...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    joblib.dump(model, "knowledge_model.pkl")
    print("✅ Model saved successfully as 'knowledge_model.pkl'")

if __name__ == "__main__":
    train()
