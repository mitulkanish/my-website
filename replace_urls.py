import os
import glob

def replace_urls():
    # Find all js and jsx files in src directory
    files = glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.js', recursive=True)
    count = 0
    
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check if file contains the hardcoded localhost string
        if 'http://localhost:8000' in content:
            # Replace basic string literals and template literals
            new_content = content.replace('"http://localhost:8000', 'import.meta.env.VITE_API_BASE_URL + "')
            new_content = new_content.replace("'http://localhost:8000", "import.meta.env.VITE_API_BASE_URL + '")
            new_content = new_content.replace('`http://localhost:8000', '`${import.meta.env.VITE_API_BASE_URL}')
            
            # Since sometimes it's just exactly the string
            new_content = new_content.replace("'http://localhost:8000'", "import.meta.env.VITE_API_BASE_URL")
            new_content = new_content.replace('"http://localhost:8000"', 'import.meta.env.VITE_API_BASE_URL')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {file_path}")
            
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    replace_urls()
