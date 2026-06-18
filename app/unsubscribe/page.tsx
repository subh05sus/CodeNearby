import { redirect } from "next/navigation";

export default function UnsubscribePage() {
  redirect("/settings/notifications");
}
