module.exports = {
    apps: [
        { 
            name: "kibu.solutions", // Name of your app
            script: "./node_modules/.bin/concurrently", // Run concurrently to handle both servers
        
            args: "\"npm run next-dev\" \"npm run fastapi-dev\"", // Start both servers with npm scripts 
            env: {
            NODE_ENV: "development", // Set the environment to development for Next.js
            },
            env_production: { NODE_ENV: "production", // Set the environment to production for Next.js
        },
        watch: false, // Optionally, you can enable watching for changes in dev mode
        },
    ],
};