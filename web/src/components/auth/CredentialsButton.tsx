import { cn } from "@/utils";
import { ReactNode } from "react";

import { type HTMLMotionProps } from "motion/react";
import MotionButton from "../common/BaseMotionButton";
import { Mail } from "lucide-react";

type BaseButtonProps = HTMLMotionProps<"button">;

function CredentialsButton({ children, className, ...props }: BaseButtonProps & { children: ReactNode, className?: string }) {
  return ( 
    <MotionButton 
      type="submit" 
      className={cn("login-button relative text-pink-50 bg-pink-500", className)}
      {...props}
    >
      <Mail className="w-[26px] h-[26px]" />
      {children}
    </MotionButton>
   );
}

export default CredentialsButton;