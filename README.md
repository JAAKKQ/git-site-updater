# Git Auto Updater
This Node.js app listens for push events on a specified GitHub repository and automatically updates a local copy of the repository if a new commit has been made.

## Requirements
Node.js

npm
## Dependencies
* https
* http
* child_process
* simple-git
* fs
* path
# Configuration
A config.json file must be located in the root directory of the project. It should contain the following properties:

```json
[
    {
        "localRepoPath": "/var/www/html/r3ne.net",
        "repoUrl": "https://api.github.com/repos/jaakkq/r3ne.net"
    }
]
```
**repoUrl:** The URL of the GitHub API endpoint for the repository you want to track.

**localRepoPath:** The file path to the local copy of the repository.
# Running the app
1. Install the dependencies: npm install
2. Start the server: `node app.js`

The server will listen for push events on port 2006. When it receives a push event, it will check if the local repository is up-to-date and update it if necessary.
