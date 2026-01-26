// @ts-nocheck
const { exec } = require('child_process');

async function main() {
    try {
        const res = await fetch('http://localhost:3000/api/cron/reminders');
        const data = await res.json();
        console.log('Cron Triggered:', data);
    } catch (e) {
        console.error('Error triggering cron:', e);
    }
}

main();
export { };
