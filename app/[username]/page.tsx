import { getUserByUsername } from "@/data/user";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PublicProfileProps {
    params: Promise<{ username: string }>;
}

const PublicProfilePage = async ({ params }: PublicProfileProps) => {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10">
            <div className="text-center mb-8">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-500">@{user.username}</p>
                {user.bio && <p className="mt-2 max-w-md text-gray-600">{user.bio}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full px-4">
                {user.services.map((service: any) => (
                    <Card key={service.id} className="hover:shadow-lg transition">
                        <CardHeader>
                            <CardTitle>{service.title}</CardTitle>
                            <CardDescription>{service.duration} Minutes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">{service.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" asChild>
                                <Link href={`/${user.username}/${service.url}`}>
                                    Select
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default PublicProfilePage;
