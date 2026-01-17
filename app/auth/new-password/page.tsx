import { NewPasswordForm } from "@/components/auth/new-password-form";
import { MotionDiv, fadeIn } from "@/components/ui/motion";

const NewPasswordPage = () => {
    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black"
        >
            <NewPasswordForm />
        </MotionDiv>
    );
}

export default NewPasswordPage;
