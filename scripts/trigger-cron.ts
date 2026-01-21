async function main() {
    console.log("Triggering Cron Job...");
    try {
        const res = await fetch("http://localhost:3000/api/cron/reminders", {
            method: "GET",
            // headers: { "Authorization": "Bearer ..." } // Not needed if CRON_SECRET is valid or check is weak
        });
        const json = await res.json();
        console.log("Status:", res.status);
        console.log("Result:", JSON.stringify(json, null, 2));
    } catch (e) {
        console.error("Failed to fetch:", e);
    }
}
main();
export { };
