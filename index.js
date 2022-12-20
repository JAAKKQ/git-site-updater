const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const simpleGit = require('simple-git');
const fs = require('fs');

let config;

try {
    const configContent = fs.readFileSync('config.json');
    config = JSON.parse(configContent);
    console.log(config);
} catch (error) {
    console.error(error);
    process.exit(1);
}

simpleGit(config.localRepoPath).clean(simpleGit.CleanOptions.FORCE);

const options = {
    headers: {
        'User-Agent': 'MyApp/1.0',
    },
};

function autoUpdate() {
    https.get(config.repoUrl, options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            const repoData = JSON.parse(data);
            let lastPushDate = new Date(repoData.pushed_at).setSeconds(0);
            console.log("Remote: " + lastPushDate);
            exec('git log -1 --format=%cd', { cwd: config.localRepoPath }, (error, stdout) => {
                if (error) {
                    console.error(error);
                    return;
                }
                const localLastPushDate = new Date(stdout.trim()).setSeconds(0);;
                console.log("Local: " + localLastPushDate);
                if (localLastPushDate === lastPushDate) {
                    console.log('Local repository is up-to-date');
                    setTimeout(() => {
                        autoUpdate();
                    }, 5000);
                } else {
                    console.log('Updating local repo...');
                    simpleGit(config.localRepoPath).pull((error, pullResult) => {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        console.log(pullResult);
                        setTimeout(() => {
                            autoUpdate();
                        }, 5000);
                    })
                }
            });
        }).on('error', (error) => {
            console.error(error);
        });
    })
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
            if (true) {
                console.log("Push event");
                // Execute the JavaScript code you want to run in response to the push event
                https.get(config.repoUrl, options, (response) => {
                    let data = '';
                    response.on('data', (chunk) => {
                        data += chunk;
                    });
                    response.on('end', () => {
                        const repoName = JSON.parse(data).name;
                        console.log("Prosessing...")
                        if (payload.repository.name == repoName) {
                            autoUpdate();
                        }
                    }).on('error', (error) => {
                        console.error(error);
                    });
                })
            }
        });
    }
});

// Start the server
server.listen(2006, () => {
    console.log('Server listening on port 2006');
});