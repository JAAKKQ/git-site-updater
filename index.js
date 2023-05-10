const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const { dirname } = require('path');
const RootFolder = dirname(require.main.filename);

const options = {
    headers: {
        'User-Agent': 'MyApp/1.0',
    },
};

let repos;

fs.readFile(RootFolder + "/config.json", 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading JSON file: ${err}`);
        return;
    }

    try {
        repos = JSON.parse(data);
    } catch (error) {
        console.error(`Error parsing JSON file: ${error}`);
    }
});

function autoUpdate(payload) {
    repos.forEach((repo) => {
        const { localRepoPath, repoUrl } = repo;

        https.get(repoUrl, options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                const repoName = JSON.parse(data).name;
                console.log("Prosessing...")
                exec(`cd ${localRepoPath} && sudo git pull`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(`Error updating local repo (${localRepoPath}): ${err}`);
                        return;
                    }

                    console.log(`Local repo (${localRepoPath}) updated successfully:\n${stdout}`);
                });
            }).on('error', (error) => {
                console.error(error);
            });
        })
    });
}

// Set up the server to listen for webhook requests
const server = http.createServer((request, response) => {
    // Check if the request is a POST request and the payload is in the expected format
    response.end('Hello World\n');
    if (request.method === 'POST' && request.headers['content-type'] === 'application/json') {
        console.log("Got post...");
        // Parse the request body as a JSON object
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            const payload = JSON.parse(body);
            console.log(payload);
            // Check if the event type is a push event
            console.log("Push event");
            // Execute the JavaScript code you want to run in response to the push event
            autoUpdate(payload);
        });
    }
});

// Start the server
server.listen(2006, () => {
    console.log('Server listening on port 2006');
});