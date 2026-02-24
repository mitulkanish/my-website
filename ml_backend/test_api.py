import requests

url = "http://localhost:8000/upload-pdf"
files = {'file': open('app.py', 'rb')}
response = requests.post(url, files=files)
print(response.json())
