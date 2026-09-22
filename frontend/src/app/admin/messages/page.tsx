"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Inbox,
  Search,
  Mail,
  Trash2,
  Send,
  RefreshCw,
  User,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { contactApi } from "@/lib/api";
import type { ContactMessage, ContactMessageStatus } from "@/types";

const statusColors: Record<ContactMessageStatus, string> = {
  UNREAD:
    "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  READ: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  REPLIED:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  ARCHIVED:
    "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400",
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<
    ContactMessageStatus | "ALL"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchMessages = () => {
    setIsLoading(true);
    const params =
      statusFilter !== "ALL" ? { status: statusFilter } : undefined;
    contactApi
      .getMessages(params)
      .then((res) => {
        const data = res.data?.data || [];
        setMessages(data);
        if (data.length > 0 && !selectedMessage) {
          setSelectedMessage(data[0]);
          setNotes(data[0].notes || "");
        } else if (selectedMessage) {
          const updated = data.find((m) => m.id === selectedMessage.id);
          if (updated) {
            setSelectedMessage(updated);
            setNotes(updated.notes || "");
          }
        }
      })
      .catch(() => {
        toast.error("Failed to load concierge inquiries");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setNotes(msg.notes || "");
    // Automatically mark unread message as read
    if (msg.status === "UNREAD") {
      contactApi
        .updateStatus(msg.id, { status: "READ" })
        .then(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, status: "READ" } : m))
          );
          setSelectedMessage((prev) =>
            prev ? { ...prev, status: "READ" } : null
          );
        })
        .catch(() => {});
    }
  };

  const handleStatusChange = (newStatus: ContactMessageStatus) => {
    if (!selectedMessage) return;
    startTransition(async () => {
      try {
        await contactApi.updateStatus(selectedMessage.id, {
          status: newStatus,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id ? { ...m, status: newStatus } : m
          )
        );
        setSelectedMessage((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
        toast.success(`Marked inquiry as ${newStatus.toLowerCase()}`);
      } catch {
        toast.error("Failed to update message status");
      }
    });
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    setIsSavingNotes(true);
    try {
      await contactApi.updateStatus(selectedMessage.id, {
        status: selectedMessage.status,
        notes,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, notes } : m))
      );
      setSelectedMessage((prev) => (prev ? { ...prev, notes } : null));
      toast.success("Concierge notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await contactApi.deleteMessage(deleteConfirmId);
      setMessages((prev) => prev.filter((m) => m.id !== deleteConfirmId));
      if (selectedMessage?.id === deleteConfirmId) {
        const remaining = messages.filter((m) => m.id !== deleteConfirmId);
        setSelectedMessage(remaining[0] || null);
        setNotes(remaining[0]?.notes || "");
      }
      toast.success("Inquiry deleted");
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

  const filteredMessages = messages.filter((msg) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      (msg.subject && msg.subject.toLowerCase().includes(q)) ||
      msg.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-[1600px] p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-light tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
              Concierge <span className="font-semibold">Inquiries</span>
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Review client requests, bespoke fitting inquiries, and atelier
            correspondence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Split-Pane View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Messages List (5 cols) */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-900">
          {/* Controls Bar */}
          <div className="space-y-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, email, or content..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-4 pl-9 text-xs text-zinc-900 focus:border-zinc-950 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(["ALL", "UNREAD", "READ", "REPLIED", "ARCHIVED"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                      statusFilter === status
                        ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="max-h-[700px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <RefreshCw size={24} className="animate-spin text-zinc-400" />
                <p className="mt-3 text-xs text-zinc-500">
                  Loading inquiries...
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
                <Inbox
                  size={36}
                  strokeWidth={1.2}
                  className="text-zinc-300 dark:text-zinc-700"
                />
                <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No inquiries found
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {searchQuery
                    ? "Try refining your search terms"
                    : "All client messages are processed"}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = msg.status === "UNREAD";
                const dateStr = new Date(msg.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  }
                );

                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => handleSelectMessage(msg)}
                    className={`relative flex w-full flex-col gap-1.5 p-4 text-left transition-colors ${
                      isSelected
                        ? "bg-zinc-100/80 dark:bg-zinc-800/80"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    {isUnread && (
                      <div className="absolute top-4 left-1.5 h-2 w-2 rounded-full bg-amber-500" />
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-xs ${
                          isUnread
                            ? "font-bold text-zinc-950 dark:text-white"
                            : "font-medium text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {msg.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p
                        className={`flex-1 truncate text-xs ${
                          isUnread
                            ? "font-semibold text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {msg.subject || "General Inquiry"}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${statusColors[msg.status]}`}
                      >
                        {msg.status}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {msg.message}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Detail (7 cols) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-7 dark:border-zinc-800 dark:bg-zinc-900">
          {selectedMessage ? (
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Detail Header */}
                <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                        {selectedMessage.subject || "General Client Inquiry"}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusColors[selectedMessage.status]}`}
                      >
                        {selectedMessage.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-zinc-400" />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {selectedMessage.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-zinc-400" />
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                            selectedMessage.subject || "Inquiry"
                          )}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-zinc-400" />
                        <span>
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                        selectedMessage.subject || "Inquiry"
                      )}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:scale-[0.98] dark:bg-white dark:text-zinc-950"
                    >
                      <Send size={13} />
                      Reply via Email
                    </a>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteConfirmId(selectedMessage.id)}
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      title="Delete Inquiry"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-950">
                  <Tag size={14} className="text-zinc-400" />
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                    Status:
                  </span>
                  <div className="flex items-center gap-1">
                    {(["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStatusChange(status)}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                            selectedMessage.status === status
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                    Inquiry Details
                  </p>
                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-6 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-200">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      <FileText size={13} />
                      Concierge Internal Notes
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="text-xs"
                    >
                      {isSavingNotes ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private team notes regarding fittings, VIP client status, or resolution..."
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-36 text-center text-zinc-400">
              <Inbox size={48} strokeWidth={1} />
              <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Select an inquiry to view details
              </p>
              <p className="mt-1 text-xs">
                Pick a message from the left list to review client queries and
                respond.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Inquiry"
        description="Are you sure you want to permanently delete this client inquiry? This action cannot be undone."
      />
    </div>
  );
}
