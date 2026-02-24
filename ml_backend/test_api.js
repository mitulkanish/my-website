const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        const formData = new FormData();
        const fileContent = fs.readFileSync(path.join(__dirname, 'app.py'));
        const blob = new Blob([fileContent], { type: 'text/plain' });
        formData.append('file', blob, 'app.py');

        const response = await fetch('http://localhost:8000/upload-pdf', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
testUpload();
