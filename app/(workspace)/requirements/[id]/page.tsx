"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Download,
  FileText,
  MapPin,
  Send,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";

import { useMarketplaceSession } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatCountdown,
  formatCurrency,
  formatDateTime,
  getRequirementById,
  submitBidForRequirement,
  updateBidStatus,
} from "@/lib/marketplace";

export default function RequirementDetailPage() {
  const params = useParams<{ id: string }>();
  const { profile } = useMarketplaceSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ bidId: string; status: "SHORTLISTED" | "REJECTED" | "AWARDED" } | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [bidForm, setBidForm] = useState({
    price: "",
    deliveryDays: "",
    paymentTerms: "Net 30",
    advancePercent: "0",
    note: "",
    documentName: "",
  });

  const detail = useMemo(() => getRequirementById(params.id), [params.id, refreshKey]);
  const myBid = useMemo(
    () => detail?.bids.find((bid) => bid.supplierId === profile?.id) ?? null,
    [detail, profile?.id]
  );

  if (!profile) {
    return null;
  }

  if (!detail) {
    return (
      <Card className="border-white/80 bg-white/85 p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-950">Requirement not found</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This detail route could not find a matching requirement in the frontend data store.
        </p>
      </Card>
    );
  }

  const isBuyerOwner = profile.role === "BUYER" && detail.buyerId === profile.id;
  const isSupplier = profile.role === "SUPPLIER";
  const isClosed = detail.status !== "OPEN" || new Date(detail.deadline).getTime() <= Date.now();
  const bidDisabledReason = isClosed
    ? "This requirement is no longer open for bids."
    : profile.kycStatus !== "APPROVED"
      ? "Only approved supplier accounts can submit bids."
      : myBid
        ? "You already submitted a bid on this requirement."
        : "";

  const shareRequirement = async () => {
    const shareUrl = `${window.location.origin}/requirements/${detail.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice("Requirement link copied to clipboard.");
    } catch {
      setNotice(shareUrl);
    }
  };

  const submitBid = () => {
    try {
      submitBidForRequirement(detail.id, {
        price: Number(bidForm.price || 0),
        deliveryDays: Number(bidForm.deliveryDays || 0),
        paymentTerms: bidForm.paymentTerms,
        advancePercent: Number(bidForm.advancePercent || 0),
        note: bidForm.note,
        documentName: bidForm.documentName || "proposal.pdf",
      });
      setNotice("Bid submitted successfully.");
      setDrawerOpen(false);
      setRefreshKey((value) => value + 1);
      setBidForm({
        price: "",
        deliveryDays: "",
        paymentTerms: "Net 30",
        advancePercent: "0",
        note: "",
        documentName: "",
      });
      setError("");
    } catch (nextError: any) {
      setError(nextError?.message || "Unable to submit bid.");
    }
  };

  const applyBidAction = () => {
    if (!confirmAction) {
      return;
    }

    updateBidStatus(detail.id, confirmAction.bidId, confirmAction.status);
    setNotice(
      confirmAction.status === "SHORTLISTED"
        ? "Bid shortlisted."
        : confirmAction.status === "REJECTED"
          ? "Bid rejected."
          : "Bid awarded and requirement updated."
    );
    setRefreshKey((value) => value + 1);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      {confirmAction ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4">
          <Card className="w-full max-w-md border-white/80 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-950">Confirm action</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {confirmAction.status === "SHORTLISTED"
                ? "Move this bid into the shortlist?"
                : confirmAction.status === "REJECTED"
                  ? "Reject this bid?"
                  : "Award this bid and close the requirement?"}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={applyBidAction}>
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30">
          <button type="button" className="absolute inset-0" onClick={() => setDrawerOpen(false)} aria-label="Close bid drawer" />
          <div className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-white/80 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Bid slide-over</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Submit proposal</h2>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setDrawerOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Price per unit total">
                  <Input type="number" className="h-11" value={bidForm.price} onChange={(event) => setBidForm({ ...bidForm, price: event.target.value })} />
                </Field>
                <Field label="Delivery in days">
                  <Input type="number" className="h-11" value={bidForm.deliveryDays} onChange={(event) => setBidForm({ ...bidForm, deliveryDays: event.target.value })} />
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Payment terms">
                  <Input className="h-11" value={bidForm.paymentTerms} onChange={(event) => setBidForm({ ...bidForm, paymentTerms: event.target.value })} />
                </Field>
                <Field label="Advance percent">
                  <Input type="number" className="h-11" value={bidForm.advancePercent} onChange={(event) => setBidForm({ ...bidForm, advancePercent: event.target.value })} />
                </Field>
              </div>
              <Field label="Covering note">
                <textarea
                  value={bidForm.note}
                  onChange={(event) => setBidForm({ ...bidForm, note: event.target.value })}
                  className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                />
              </Field>
              <label className="block rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-900">Document upload placeholder</p>
                <p className="mt-2 text-sm text-slate-500">{bidForm.documentName || "No proposal file selected"}</p>
                <input
                  type="file"
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                  onChange={(event) => setBidForm({ ...bidForm, documentName: event.target.files?.[0]?.name || "" })}
                />
              </label>
              <Button className="w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={submitBid}>
                Submit bid
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card className="border-white/80 bg-white/85 p-7 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">{detail.category}</Badge>
                  <Badge variant="outline">{detail.bidMode.replaceAll("_", " ")}</Badge>
                  {detail.buyerVerified ? (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="size-3" />
                      Verified buyer
                    </Badge>
                  ) : null}
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950">{detail.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{detail.description}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-200 bg-white" onClick={shareRequirement}>
                  <Share2 className="mr-2 size-4" />
                  Share
                </Button>
                <Button variant="outline" className="border-slate-200 bg-white">
                  <Download className="mr-2 size-4" />
                  {detail.specFileName}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Quantity" value={`${detail.quantity.toLocaleString("en-IN")} ${detail.unit}`} />
              <InfoCard
                label="Budget"
                value={
                  detail.budgetUndisclosed
                    ? "Undisclosed"
                    : `${formatCurrency(detail.budgetMin)} - ${formatCurrency(detail.budgetMax)}`
                }
              />
              <InfoCard label="Delivery location" value={detail.deliveryLocation} />
              <InfoCard label="Closing" value={formatCountdown(detail.deadline)} />
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Requirement detail</p>
              <div className="mt-3 grid gap-3 text-sm text-slate-600">
                <p>Buyer: {detail.buyerName} • {detail.buyerCompany}</p>
                <p>Entity type: {detail.buyerBadge.replaceAll("_", " ")}</p>
                <p>Created: {formatDateTime(detail.createdAt)}</p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#2563EB]" />
                  {detail.deliveryLocation}, {detail.deliveryState}
                </p>
              </div>
            </div>
          </Card>

          {isBuyerOwner ? (
            <Card className="border-white/80 bg-white/85 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Bid tray</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Buyer-side table with prices, delivery days, supplier details, and actions.
                  </p>
                </div>
                <Badge className="bg-[#10213d] text-white hover:bg-[#10213d]">{detail.bids.length} bids</Badge>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-3 font-medium">Supplier</th>
                      <th className="px-3 py-3 font-medium">Price</th>
                      <th className="px-3 py-3 font-medium">Delivery</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.bids.map((bid) => (
                      <tr key={bid.id} className="border-b border-slate-100">
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-slate-900">{bid.supplierCompany}</p>
                              <p className="text-xs text-slate-500">{bid.supplierName}</p>
                            </div>
                            {bid.supplierVerified ? <ShieldCheck className="size-4 text-emerald-600" /> : null}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-slate-700">{formatCurrency(bid.price)}</td>
                        <td className="px-3 py-4 text-slate-700">{bid.deliveryDays} days</td>
                        <td className="px-3 py-4">
                          <Badge
                            variant={
                              bid.status === "AWARDED" ? "default" : bid.status === "REJECTED" ? "destructive" : "outline"
                            }
                          >
                            {bid.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmAction({ bidId: bid.id, status: "SHORTLISTED" })}>
                              Shortlist
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setConfirmAction({ bidId: bid.id, status: "REJECTED" })}>
                              Reject
                            </Button>
                            <Button size="sm" className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]" onClick={() => setConfirmAction({ bidId: bid.id, status: "AWARDED" })}>
                              Accept
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit border-white/80 bg-white/85 p-6 shadow-xl xl:sticky xl:top-28">
          <p className="text-sm font-semibold text-slate-500">
            {isBuyerOwner ? "Buyer panel" : "Bid or proposal CTA"}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {isBuyerOwner ? "Review supplier responses" : "Submit your proposal"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isBuyerOwner
              ? "Action row controls mirror the buyer bid tray. Use shortlist, reject, or accept with confirmation."
              : "Suppliers can bid from this page through the slide-over drawer. CTA is guarded by account status and requirement state."}
          </p>

          {!isBuyerOwner ? (
            <>
              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <p>KYC status: {profile.kycStatus}</p>
                <p className="mt-2">Existing bid: {myBid ? `${formatCurrency(myBid.price)} • ${myBid.status}` : "Not submitted yet"}</p>
              </div>
              <div className="mt-5">
                <Button
                  className="w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8] disabled:bg-slate-300"
                  onClick={() => setDrawerOpen(true)}
                  disabled={Boolean(bidDisabledReason)}
                  title={bidDisabledReason || "Submit bid"}
                >
                  <Send className="mr-2 size-4" />
                  Submit bid / proposal
                </Button>
                {bidDisabledReason ? (
                  <p className="mt-3 text-sm text-amber-700">{bidDisabledReason}</p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-600">
                Contact shield is <strong>{detail.contactShield ? "on" : "off"}</strong>. Messaging threads are linked from the inbox panel.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <FileText className="size-4 text-[#2563EB]" />
              Requirement documents
            </p>
            <p className="mt-3 text-sm text-slate-600">{detail.specFileName}</p>
          </div>

          <Link href="/messages" className="mt-4 block">
            <Button variant="outline" className="w-full border-slate-200 bg-white">
              Open related messages
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      {children}
    </div>
  );
}
