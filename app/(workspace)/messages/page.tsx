"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Dot, Search, Send } from "lucide-react";

import { useMarketplaceSession } from "@/components/marketplace/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatDateTime,
  getInboxThreads,
  markInboxThreadRead,
  sendInboxMessage,
  type InboxThread,
} from "@/lib/marketplace";

export default function MessagesPage() {
  const { profile } = useMarketplaceSession();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    const loadThreads = () => {
      try {
        setLoading(true);
        const nextThreads = getInboxThreads(profile.id);
        setThreads(nextThreads);
        setSelectedId((current) => current || nextThreads[0]?.id || "");
      } catch (nextError: any) {
        setError(nextError?.message || "Failed to load inbox.");
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
    const interval = window.setInterval(loadThreads, 10000);
    return () => window.clearInterval(interval);
  }, [profile?.id]);

  const filteredThreads = useMemo(
    () =>
      threads.filter((thread) => {
        const text = `${thread.counterpartName} ${thread.counterpartCompany} ${thread.subject}`.toLowerCase();
        return text.includes(query.toLowerCase());
      }),
    [threads, query]
  );

  const activeThread = filteredThreads.find((thread) => thread.id === selectedId) ?? filteredThreads[0] ?? null;

  useEffect(() => {
    if (activeThread?.id) {
      markInboxThreadRead(activeThread.id);
      setThreads(getInboxThreads(profile?.id));
    }
  }, [activeThread?.id, profile?.id]);

  const sendMessage = () => {
    if (!activeThread || !draft.trim() || activeThread.shielded) {
      return;
    }

    try {
      sendInboxMessage(activeThread.id, draft.trim());
      setDraft("");
      setThreads(getInboxThreads(profile?.id));
    } catch (nextError: any) {
      setError(nextError?.message || "Unable to send message.");
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="border-white/80 bg-white/85 p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Inbox</h2>
            <p className="mt-1 text-sm text-slate-500">Thread list with unread state and 10-second polling.</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="size-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search threads"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="mt-5 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-48 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))
          ) : filteredThreads.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
              No conversation matched this view.
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setSelectedId(thread.id)}
                className={`w-full rounded-[22px] border p-4 text-left transition ${
                  activeThread?.id === thread.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-900">{thread.counterpartName}</p>
                      {thread.unreadCount > 0 ? <Dot className="size-5 text-emerald-600" /> : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{thread.counterpartCompany}</p>
                  </div>
                  <p className="text-xs text-slate-400">{formatDateTime(thread.lastMessageAt)}</p>
                </div>
                <p className="mt-3 truncate text-sm text-slate-600">{thread.lastMessage}</p>
              </button>
            ))
          )}
        </div>
      </Card>

      <Card className="border-white/80 bg-white/85 p-0 shadow-xl">
        {!activeThread ? (
          <div className="flex min-h-[520px] items-center justify-center p-8 text-center text-sm text-slate-500">
            Select a thread to open the conversation panel.
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-sm font-semibold text-slate-900">{activeThread.counterpartName}</p>
              <p className="mt-1 text-sm text-slate-500">{activeThread.subject}</p>
            </div>

            {error ? (
              <div className="mx-6 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {activeThread.messages.map((message) => (
                <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-[24px] px-4 py-3 text-sm shadow-sm ${
                      message.mine ? "bg-[#2563EB] text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <p className="font-medium">{message.senderName}</p>
                    <p className="mt-2 leading-6">{message.body}</p>
                    <p className={`mt-2 text-xs ${message.mine ? "text-blue-100" : "text-slate-400"}`}>
                      {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              {activeThread.shielded ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4" />
                    <p>Contact shield is active on this thread. Messaging input is intentionally blocked.</p>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-3">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={activeThread.shielded ? "Messaging disabled while contact shield is active" : "Type your message"}
                  disabled={activeThread.shielded}
                  className="h-11 bg-white"
                />
                <Button
                  className="h-11 bg-[#2563EB] px-5 text-white hover:bg-[#1d4ed8]"
                  onClick={sendMessage}
                  disabled={activeThread.shielded || !draft.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
