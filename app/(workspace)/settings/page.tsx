import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-950">Settings</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Lightweight placeholder settings page so the protected shell navigation remains complete. This keeps the
          frontend stable without introducing backend dependencies.
        </p>
      </Card>
    </div>
  );
}
