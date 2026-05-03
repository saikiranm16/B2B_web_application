import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UpgradePage() {
  return (
    <div className="space-y-6">
      <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
        <Badge className="bg-[#10213d] text-white hover:bg-[#10213d]">Supplier tier comparison</Badge>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Choose the visibility level you want buyers to see</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          This static comparison page supports the dashboard upgrade prompt and keeps the flow demo-ready without
          requiring billing or backend wiring.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
          <p className="text-sm font-semibold text-slate-500">FREE</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Starter visibility</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>Standard placement in supplier listings</li>
            <li>Core bidding and messaging workflow</li>
            <li>Best for low-frequency marketplace usage</li>
          </ul>
          <Button variant="outline" className="mt-6 border-slate-200 bg-white">Current baseline</Button>
        </Card>

        <Card className="border-blue-200 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-7 shadow-xl">
          <p className="text-sm font-semibold text-blue-700">LIMIT</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Higher prominence</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>Better marketplace prominence and trust framing</li>
            <li>More visible CTA treatment in buyer comparisons</li>
            <li>Intended for suppliers actively chasing pipeline growth</li>
          </ul>
          <Button className="mt-6 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">Upgrade CTA</Button>
        </Card>
      </div>
    </div>
  );
}
