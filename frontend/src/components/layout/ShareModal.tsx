"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Copy, Check, Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    return typeof window !== "undefined"
      ? window.location.href
      : "https://thecurator.fashion";
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link Copied to Clipboard", {
        description: "You can now share it with friends.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const url = encodeURIComponent(getShareUrl());
  const text = encodeURIComponent(
    "Explore curated archival fashion and editorial pieces at THE CURATOR."
  );

  const shareChannels = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "hover:bg-emerald-500 hover:text-white hover:border-emerald-500",
      href: `https://wa.me/?text=${text}%20${url}`,
    },
    {
      name: "X / Twitter",
      icon: Send,
      color: "hover:bg-black hover:text-white hover:border-black",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "hover:bg-sky-500 hover:text-white hover:border-sky-500",
      href: `https://t.me/share/url?url=${url}&text=${text}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "hover:bg-neutral-800 hover:text-white hover:border-neutral-800",
      href: `mailto:?subject=THE%20CURATOR%20Archival%20Fashion&body=${text}%0A%0A${url}`,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Collection"
      description="Share this curated editorial experience with your network."
      maxWidth="sm"
    >
      <div className="space-y-6 pt-2">
        {/* Quick Copy Link Box */}
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
            Page URL
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-low p-2">
            <input
              type="text"
              readOnly
              value={getShareUrl()}
              className="flex-1 bg-transparent px-2 font-mono text-xs text-on-surface outline-hidden select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-on-primary transition hover:bg-primary/90"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div>
          <label className="mb-3 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
            Share Via
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {shareChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 rounded-lg border border-outline-variant/60 bg-surface px-4 py-3 text-xs font-medium text-on-surface transition-all ${channel.color}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{channel.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
