import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

// You would need to store/retrieve the user's refresh token from the DB (Account model)
// This is a simplified helper assuming you have the tokens.

export const getGoogleCalendar = async (userId: string) => {
    const account = await prisma.account.findFirst({
        where: { userId, provider: "google" },
    });

    if (!account || !account.access_token) {
        return null;
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });

    return google.calendar({ version: "v3", auth });
};

export const getBusyTimes = async (userId: string, start: Date, end: Date) => {
    const calendar = await getGoogleCalendar(userId);
    if (!calendar) return [];

    try {
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: start.toISOString(),
                timeMax: end.toISOString(),
                items: [{ id: "primary" }],
            },
        });

        return response.data.calendars?.primary?.busy || [];
    } catch (error) {
        console.error("Error fetching Google Calendar busy times:", error);
        return [];
    }
};
