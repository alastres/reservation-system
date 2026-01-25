import { getServices } from "@/actions/services";
import { ServicesClient } from "@/components/services/services-client";
import { getUserPlan } from "@/actions/user";

const ServicesPage = async () => {
    const services = await getServices();
    const userStatus = await getUserPlan();

    return <ServicesClient services={services} subscriptionPlan={userStatus?.plan} role={userStatus?.role} username={userStatus?.username} />;
}

export default ServicesPage;
