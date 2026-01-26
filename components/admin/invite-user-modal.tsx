"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Loader2, Mail } from "lucide-react";
import { inviteUser } from "@/actions/admin";
import { toast } from "sonner";

const InviteUserSchema = z.object({
    email: z.string().email(),
});

export const InviteUserModal = () => {
    const t = useTranslations("Admin.overview");
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof InviteUserSchema>>({
        resolver: zodResolver(InviteUserSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (values: z.infer<typeof InviteUserSchema>) => {
        startTransition(() => {
            inviteUser(values.email).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    toast.success(t("inviteSuccess"));
                    setOpen(false);
                    form.reset();
                }
            });
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full text-left p-3 rounded-lg hover:bg-muted/50 flex items-center gap-3 transition-colors border border-border">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{t("inviteUser")}</p>
                        <p className="text-xs text-muted-foreground">{t("inviteDesc")}</p>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("inviteUser")}</DialogTitle>
                    <DialogDescription>
                        {t("inviteModalDesc")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("emailLabel")}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="colleague@example.com"
                                                className="pl-9"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending} className="w-full">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("sending")}
                                    </>
                                ) : (
                                    t("sendInvitation")
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
