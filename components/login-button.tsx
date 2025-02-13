import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

function LoginButton() {
  return (
    <Button
      variant="secondary"
      className="my-2"
      onClick={async () => {
        await signIn("github", {
          callbackUrl: window.location.href,
        });
      }}
    >
      <Github className="inline mr-2" />
      Login with GitHub
    </Button>
  );
}

export default LoginButton;
