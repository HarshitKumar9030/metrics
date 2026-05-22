"use client";

import { useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateApiKeyDialog({ projectId }: { projectId: string }) {
  const [label, setLabel] = useState("SDK key");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/projects/keys", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ projectId, label }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload?.error ?? "Could not generate key");
      setLoading(false);
      return;
    }

    setApiKey(payload.apiKey);
    setLoading(false);
  }

  async function onCopy() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <KeyRound className="h-4 w-4" />
          New key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>Use separate keys per app for cleaner tracking.</DialogDescription>
        </DialogHeader>

        {!apiKey ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={label} onChange={(event) => setLabel(event.target.value)} />
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button onClick={onCreate} disabled={loading || label.trim().length < 2}>
              {loading ? "Creating..." : "Generate key"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-md border border-amber-300/20 bg-amber-200/10 p-3 text-sm text-amber-100">
              This full key is shown once. Store it before closing.
            </p>
            <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 font-mono text-sm text-[color:var(--text)] break-all">
              {apiKey}
            </div>
            <Button variant="secondary" onClick={onCopy}>
              <Copy className="h-4 w-4" />
              Copy key
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
