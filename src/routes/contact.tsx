import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · AutoVerse" },
      { name: "description", content: "Get in touch with the AutoVerse team — customer support, dealer partnerships, press." },
      { property: "og:title", content: "Contact · AutoVerse" },
      { property: "og:description", content: "Reach out for help, feedback or to partner with us." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Message received", { description: "We'll reply within one business day." });
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Get in touch</p>
          <h1 className="mt-3 font-display text-4xl font-bold italic uppercase tracking-tight md:text-5xl">
            We&apos;re here to help.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Customer support, dealer partnerships, press — write to us and a real person will reply
            within one business day.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 size-4 text-brand" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</p>
                <p className="text-sm">hello@mytyresandalloys.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 size-4 text-brand" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Support line</p>
                <p className="text-sm">+91 22 6000 1234 · Mon–Sat 10am–7pm IST</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-4 text-brand" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">HQ</p>
                <p className="text-sm">Growsleek Studios, Lower Parel, Mumbai 400013</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <Button type="submit" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            Send message
          </Button>
        </form>
      </div>
    </div>
  );
}
