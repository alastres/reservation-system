import { getServices } from "@/actions/services";
import { ServicesClient } from "@/components/services/services-client";

const ServicesPage = async () => {
    const services = await getServices();

    return <ServicesClient services={services} />;
}

export default ServicesPage;
