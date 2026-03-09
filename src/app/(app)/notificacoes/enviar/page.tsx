import { SendNotificationForm } from "@/components/notifications/send-notification-form";
import { BackButton } from "@/components/ui/back-button";

export default function EnviarNotificacaoPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <BackButton fallbackHref="/dashboard" />
      <SendNotificationForm />
    </div>
  );
}
