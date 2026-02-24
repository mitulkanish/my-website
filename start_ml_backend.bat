@echo off
echo Starting the Academic Intelligence ML Backend...
cd ml_backend
python -m uvicorn app:app --reload --port 8000
