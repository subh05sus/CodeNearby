import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import SwissButton from "./swiss/SwissButton";

function LoginButton() {
  return (
    <SwissButton
      variant="secondary"
      className="my-2"
      onClick={async () => {
        await signIn("github", {
          callbackUrl: window.location.href,
        });
      }}
    >
      <Github className="inline mr-2" />
      LOGIN WITH GITHUB
    </SwissButton>
  );
}

export default LoginButton;
