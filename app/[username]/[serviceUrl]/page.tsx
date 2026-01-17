import { getUserByUsername } from "@/data/user";
import { notFound } from "next/navigation";
import { BookingCalendar } from "@/components/booking/booking-calendar";


interface ServicePageProps {
    params: Promise<{ username: string; serviceUrl: string }>;
}

const ServiceBookingPage = async ({ params }: ServicePageProps) => {
    const { username, serviceUrl } = await params;
    const user = await getUserByUsername(username);
    if (!user) return notFound();

    const service = user.services.find((s: any) => s.url === serviceUrl);
    if (!service) return notFound();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="border rounded-lg shadow-xl flex w-full max-w-5xl h-[600px] overflow-hidden">
                {/* Left Panel: Details */}
                <div className="w-1/3 bg-slate-50 p-6 border-r">
                    <p className="text-gray-500 font-medium">{user.name}</p>
                    <h1 className="text-2xl font-bold mt-2">{service.title}</h1>
                    <div className="flex items-center text-gray-500 mt-4 text-sm">
                        <span className="mr-4">{service.duration} min</span>
                        <span>{service.price > 0 ? `$${service.price}` : "Free"}</span>
                    </div>
                    <p className="mt-6 text-gray-600 text-sm whitespace-pre-wrap">{service.description}</p>
                </div>

                {/* Right Panel: Calendar & Slots */}
                <div className="w-2/3 p-6 overflow-y-auto">
                    <BookingCalendar service={service} user={user} />
                </div>
            </div>
        </div>
    );
}

export default ServiceBookingPage;
