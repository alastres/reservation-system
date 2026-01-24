import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { MotionDiv, fadeIn } from "@/components/ui/motion";

const VerifyEmailPage = () => {
    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black"
        >
            <VerifyEmailForm />
        </MotionDiv>
    );
}

export default VerifyEmailPage;
