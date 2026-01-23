"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { MotionDiv, staggerContainer, fadeIn, slideUp } from "@/components/ui/motion";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { DeleteServiceButton, DuplicateServiceButton, ServiceStatusToggle } from "@/components/services/service-actions";
import { useState } from "react";
import { ServiceModal } from "@/components/services/service-modal";
import { AnimatePresence } from "framer-motion";

interface ServicesClientProps {
    services: any[]; // Using any for now to match strictness level
}

export const ServicesClient = ({ services }: ServicesClientProps) => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [localServices, setLocalServices] = useState<any[]>(services);
    const [searchQuery, setSearchQuery] = useState("");

    // Sync specific service changes when props update (to handle deletion or external updates)
    // But primarily we want to be optimistic.
    // Actually, simply resetting logic is safer for consistency with router.refresh()
    // but the user wants instant feedback.
    // Sync specific service changes when props update
    useEffect(() => {
        setLocalServices(services);
    }, [services]);

    // We can't just use useEffect because it might not run fast enough or race.
    // But we need to update state when new props come in from router.refresh().
    // AND we want to manually append when we create one.

    // Better pattern: use effect to sync with server, but optimistic updates override temporarily?
    // No, standard is: local state initializes from props.
    // When props change (router.refresh), local state updates.
    // AND we allow manual modification.

    const handleCreate = () => {
        setSelectedService(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (service: any) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedService(undefined);
    };

    const handleServiceSaved = (savedService: any) => {
        setLocalServices((prev) => {
            const index = prev.findIndex((s) => s.id === savedService.id);
            if (index >= 0) {
                // Update
                const newServices = [...prev];
                newServices[index] = savedService;
                return newServices;
            } else {
                // Create - Add to top
                return [savedService, ...prev];
            }
        });
    };

    const handleDuplicate = (newService: any) => {
        setLocalServices((prev) => [newService, ...prev]);
    };

    const handleDelete = (id: string) => {
        setLocalServices((prev) => prev.filter((s) => s.id !== id));
    };

    const handleStatusChange = (id: string, newStatus: boolean) => {
        setLocalServices((prev) => prev.map((s) => s.id === id ? { ...s, isActive: newStatus } : s));
    };

    const filteredServices = localServices.filter((service) =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.url?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <ServiceModal
                isOpen={isModalOpen}
                onClose={handleClose}
                service={selectedService}
                onServiceSaved={handleServiceSaved}
            />

            <MotionDiv
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="flex-1 space-y-4 p-8 pt-6"
            >
                <MotionDiv variants={slideUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            Services
                        </h2>
                        <p className="text-muted-foreground">
                            Manage your service offerings and pricing.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full md:w-64 hidden md:block">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/25 border-0"
                        >
                            <Plus className="" />
                            Create Service
                        </Button>
                    </div>
                </MotionDiv>

                <MotionDiv variants={fadeIn} className="relative w-full md:hidden mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search services..."
                        className="pl-8 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </MotionDiv>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {localServices.length === 0 ? (
                            <MotionDiv
                                key="no-services"
                                variants={fadeIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="col-span-full"
                            >
                                <Card className="col-span-full border-dashed border-white/10 bg-white/5 p-8">
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                                            <Plus className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg">No services created</h3>
                                            <p className="text-muted-foreground max-w-sm">
                                                Get started by creating your first service offering.
                                            </p>
                                        </div>
                                        <Button onClick={handleCreate} className="bg-primary">
                                            Create Service
                                        </Button>
                                    </div>
                                </Card>
                            </MotionDiv>
                        ) : filteredServices.length === 0 ? (
                            <MotionDiv
                                key="no-results"
                                variants={fadeIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="col-span-full"
                            >
                                <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
                                    <div className="p-4 rounded-full bg-white/5 text-muted-foreground">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">No results found</h3>
                                        <p className="text-muted-foreground">
                                            No services found matching "{searchQuery}"
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery("")}
                                        className="border-white/10 hover:bg-white/5"
                                    >
                                        Clear Search
                                    </Button>
                                </div>
                            </MotionDiv>
                        ) : (
                            filteredServices.map((service: any) => (
                                <MotionDiv
                                    key={service.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card
                                        onClick={() => {
                                            if (service.user?.username) {
                                                window.open(`/${service.user.username}/${service.url}`, '_blank');
                                            } else {
                                                // Avoid error spam, maybe just log or do nothing. 
                                                // It's possible the optimistic update hasn't populated user yet.
                                                console.warn("Service owner has no username set", service);
                                            }
                                        }}
                                        className="group relative overflow-hidden transition-all hover:shadow-xl hover:bg-white/5 border-white/10 bg-card/40 backdrop-blur-md h-full cursor-pointer"
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{service.title}</CardTitle>
                                                <ServiceStatusToggle
                                                    id={service.id}
                                                    isActive={service.isActive}
                                                    onToggle={(status) => handleStatusChange(service.id, status)}
                                                />
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">${service.price}</span>
                                                <span>•</span>
                                                <span>{service.duration} mins</span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                                {service.description || "No description provided."}
                                            </p>
                                            <div className="mt-4 flex items-center text-xs text-muted-foreground bg-black/20 p-2 rounded-md font-mono border border-white/5">
                                                /{service.url}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2 border-t border-white/5 bg-white/5 p-4">
                                            <DuplicateServiceButton id={service.id} onDuplicate={handleDuplicate} />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(service);
                                                }}
                                                className="h-8 hover:bg-white/10 hover:text-primary"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                            <DeleteServiceButton id={service.id} onDelete={handleDelete} />
                                        </CardFooter>
                                    </Card>
                                </MotionDiv>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </MotionDiv>
        </>
    );
};
