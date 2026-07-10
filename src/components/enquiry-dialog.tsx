import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createEnquiry } from "@/data/store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { Product, Service, Dealer } from "@/data/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  service?: Service;
  dealer?: Dealer;
  defaultMessage?: string;
}

export function EnquiryDialog({ open, onOpenChange, product, service, dealer, defaultMessage }: Props) {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState(defaultMessage ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please add your name and phone.");
      return;
    }
    createEnquiry({
      customerId: session?.userId ?? "guest",
      customerName: name,
      customerPhone: phone,
      customerPincode: pincode,
      productId: product?.id,
      serviceId: service?.id,
      dealerId: dealer?.id,
      message: message || `Interested in ${product?.name ?? service?.name ?? "your services"}.`,
    });
    toast.success("Enquiry sent to nearby dealers", {
      description: "You'll hear back on WhatsApp or phone shortly.",
    });
    onOpenChange(false);
    setName("");
    setPhone("");
    setPincode("");
    setMessage("");
  }

  const target = product?.name ?? service?.name ?? dealer?.name ?? "the marketplace";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase italic tracking-tight">
            Send an enquiry
          </DialogTitle>
          <DialogDescription>
            Reach out about <span className="font-medium text-foreground">{target}</span>. A verified
            dealer will call or WhatsApp you back.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98..." required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="400013" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`I'm looking for ${target}...`} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              Send enquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
