import { RegisterForm } from "@/components/auth/register-form";
import { MotionDiv, fadeIn } from "@/components/ui/motion";

const RegisterPage = () => {
    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black"
        >
            <RegisterForm />
        </MotionDiv>
    );
}

export default RegisterPage;
