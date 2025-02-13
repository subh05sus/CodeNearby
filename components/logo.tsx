import { AuroraText } from "./magicui/aurora-text";
import { Jersey_10 } from "next/font/google";

const jersey = Jersey_10({
  subsets: ["latin"],
  weight: "400",
});

function logo() {
  return (
    <h1 className={`text-5xl tracking-wide ${jersey.className}`}>
      Code<AuroraText>Nearby</AuroraText>
    </h1>
  );
}

export default logo;
