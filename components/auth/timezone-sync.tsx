"use client";

import { useEffect } from "react";
import { updateTimezone } from "@/actions/user";

interface TimezoneSyncProps {
    serverTimeZone: string;
}

export const TimezoneSync = ({ serverTimeZone }: TimezoneSyncProps) => {
    useEffect(() => {
        const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // If server is on default "UTC" (common for fresh Google accounts)
        // AND client is somewhere else, update it.
        if (serverTimeZone === "UTC" && clientTimeZone !== "UTC") {
            const hasSynced = localStorage.getItem("timezone-synced");

            // Optional: avoid re-spamming if we already tried this session/browser
            if (!hasSynced) {
                console.log(`[TimezoneSync] Updating from ${serverTimeZone} to ${clientTimeZone}`);
                updateTimezone(clientTimeZone).then(() => {
                    localStorage.setItem("timezone-synced", "true");
                });
            }
        }
    }, [serverTimeZone]);

    return null;
};
