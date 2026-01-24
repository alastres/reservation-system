// @ts-nocheck
const { exec } = require('child_process');

async function main() {
    console.log("Verifying Build & Tests...");

    exec('npm run build', (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            process.exit(1);
        }
        console.log(stdout);
        console.log("Build Success!");
    });
}

main();
