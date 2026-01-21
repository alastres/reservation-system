import { NewVerificationForm } from "@/components/auth/new-verification-form";
import { MotionDiv, fadeIn } from "@/components/ui/motion";

import { Suspense } from "react";

const NewVerificationPage = () => {
    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black"
        >
            <Suspense fallback={<div>Loading...</div>}>
                <NewVerificationForm />
            </Suspense>
        </MotionDiv>
    );
}

export default NewVerificationPage;
