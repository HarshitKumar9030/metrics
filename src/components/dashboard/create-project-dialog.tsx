"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreatedProject = {
  projectId: string;
  apiKey: string;
};

export function CreateProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload?.error ?? "Could not create project");
      setLoading(false);
      return;
    }

    setCreated(payload);
    setLoading(false);
    router.refresh();
  }

  async function onCopy() {
    if (!created?.apiKey) return;
    await navigator.clipboard.writeText(created.apiKey);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setName("");
          setCreated(null);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>Each project gets a default API key you can use in your apps.</DialogDescription>
        </DialogHeader>

        {!created ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Marketing site" />
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button onClick={onCreate} disabled={loading || name.trim().length < 2}>
              {loading ? "Creating..." : "Create project"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-md border border-amber-300/20 bg-amber-200/10 p-3 text-sm text-amber-100">
              Save this API key now. It will not be shown in full again.
            </p>
            <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 font-mono text-sm text-[color:var(--text)] break-all">
              {created.apiKey}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onCopy}>
                <Copy className="h-4 w-4" />
                Copy key
              </Button>
              <Button asChild>
                <a href={`/dashboard?project=${created.projectId}`}>Open dashboard</a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
