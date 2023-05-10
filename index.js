const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const simpleGit = require('simple-git');

// Read JSON data from file
const jsonData = fs.readFileSync('config.json', 'utf8');
const repositories = JSON.parse(jsonData);

// Create WebSocket server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Start the server
const port = 2006;

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const pushEvent = JSON.parse(message);

      const { repository, after } = pushEvent;

      // Find matching repository
      const matchedRepo = repositories.find((repo) => repo.repoUrl === repository.clone_url);
      if (!matchedRepo) {
        console.log(`No matching repository found for ${repository.clone_url}`);
        return;
      }

      const localRepoPath = matchedRepo.localRepoPath;

      const git = simpleGit(localRepoPath);

      // Check last push date from remote repository
      git.revparse('HEAD', (err, localCommitHash) => {
        if (err) {
          console.error(`Error checking local repository: ${err.message}`);
          return;
        }

        localCommitHash = localCommitHash.trim();

        if (localCommitHash !== after) {
          // Update local repository
          git.pull((err) => {
            if (err) {
              console.error(`Error updating local repository: ${err.message}`);
              return;
            }

            console.log(`Local repository updated: ${localRepoPath}`);
          });
        } else {
          console.log(`No update needed for repository: ${localRepoPath}`);
        }
      });
    } catch (error) {
      console.error(`Error processing WebSocket message: ${error.message}`);
    }
  });
});

server.listen(port, () => {
  console.log(`WebSocket server listening on port ${port}`);
});
