import { getUserByUsername } from "@/data/user";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoRefresh } from "@/components/auto-refresh";

export const revalidate = 0;

interface PublicProfileProps {
    params: Promise<{ username: string }>;
}

const PublicProfilePage = async ({ params }: PublicProfileProps) => {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) return notFound();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-16 relative overflow-hidden text-white">
            {/* Decorative background blobs - vivid colors for dark mode */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

            {/* Cover Image */}
            <div className="relative w-full h-80 bg-slate-900/50 overflow-hidden mb-12">
                {(user as any).coverImage ? (
                    <img
                        src={(user as any).coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover animate-in fade-in duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-blue-900/40 backdrop-blur-sm flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                    </div>
                )}
                {/* Gradient Overlay for text readability at bottom of cover if needed, though text is below now */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 pointer-events-none" />
            </div>

            <div className="relative text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 z-10 -mt-32 px-4">
                <Avatar className="h-40 w-40 mx-auto mb-6 ring-8 ring-slate-950 shadow-2xl shadow-black/50">
                    <AvatarImage src={user.image || ""} className="object-cover" />
                    <AvatarFallback className="text-5xl font-bold bg-slate-800 text-indigo-400">{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3 drop-shadow-lg">
                    {user.name}
                </h1>
                <p className="text-indigo-400 font-medium text-xl bg-slate-950/80 px-5 py-1.5 rounded-full inline-block backdrop-blur-md border border-indigo-500/20 shadow-lg">
                    @{user.username}
                </p>
                {user.bio && (
                    <p className="mt-8 max-w-lg mx-auto text-slate-300 leading-relaxed bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
                        {user.bio}
                    </p>
                )}
            </div>

            <AutoRefresh />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 z-10">
                {user.services.length === 0 ? (
                    <div className="col-span-full text-center p-10 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                        <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">📭</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-200 mb-2">No Services Available</h3>
                        <p className="text-slate-400">This user hasn't listed any services yet. Please check back later.</p>
                    </div>
                ) : (
                    user.services.map((service: any) => (
                        <Card key={service.id} className="group hover:scale-[1.02] transition-all duration-300 border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden hover:border-indigo-500/50 hover:bg-slate-900/60 shadow-lg">
                            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                                    {service.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 text-slate-400 font-medium mt-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                                    {service.duration} Minutes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                    {service.description || "No description provided."}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-900/50 border border-white/10" asChild>
                                    <Link href={`/${user.username}/${service.url}`}>
                                        Book Now
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            <div className="mt-auto pt-16 text-slate-600 text-sm text-center z-10">
                Powered by <span className="font-bold text-slate-500">Reservation System</span>
            </div>
        </div>
    );
}

export default PublicProfilePage;
