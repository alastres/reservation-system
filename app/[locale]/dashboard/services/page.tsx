import { getServices } from "@/actions/services";
import { ServicesClient } from "@/components/services/services-client";
import { getUserPlan } from "@/actions/user";

import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const ServicesPage = async () => {
    const services = await getServices();
    const userStatus = await getUserPlan();
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <ServicesClient services={services} subscriptionPlan={userStatus?.plan} role={userStatus?.role} username={userStatus?.username} />
        </NextIntlClientProvider>
    );
}

export default ServicesPage;
