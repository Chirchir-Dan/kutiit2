"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/validation";
import { Turnstile } from "@marsidev/react-turnstile"; // Import Turnstile
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { AlertCircle } from "lucide-react"; // For the validation hint

export function ContactModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null); // Track token

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onChange", // Better for tracking button state
    defaultValues: {
      name: "",
      email: "",
      subject: "General Inquiry",
      message: "",
      honeyPot: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    // 1. Honeypot check
    if (data.honeyPot) return;

    // 2. Extra safety check for Turnstile
    if (!turnstileToken) {
      alert("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Include the token in your API call so your backend can verify it
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken }), 
      });

      if (response.ok) {
        alert("Message received! We'll get back to you soon.");
        reset();
        setTurnstileToken(null); // Reset token
        setOpen(false);
      } else {
        alert("Something went wrong on our end.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px] w-[95vw] rounded-[2.5rem] p-10 bg-white border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">
            Contact Kutiit
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>
              Use this form to send a message to the Kutiit team regarding inquiries, lessons, or feedback.
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Honeypot */}
          <input {...register("honeyPot")} className="hidden" tabIndex={-1} />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <Input {...register("name")} placeholder="e.g. Kipchoge" className="rounded-xl bg-slate-50 border-none h-12 shadow-sm" />
            {errors.name && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
            <Input {...register("email")} type="email" placeholder="your@email.com" className="rounded-xl bg-slate-50 border-none h-12 shadow-sm" />
            {errors.email && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
            <div className="relative">
              <select 
                {...register("subject")}
                className="w-full rounded-xl bg-slate-50 h-12 px-4 text-sm border-none focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer text-slate-700 font-medium shadow-sm"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Language Lessons">Language Lessons</option>
                <option value="Project Feedback">Project Feedback</option>
                <option value="Partnership">Partnership</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
            <Textarea {...register("message")} placeholder="How can we help?" className="rounded-xl bg-slate-50 border-none min-h-[100px] shadow-sm" />
            {errors.message && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.message.message}</p>}
          </div>

          {/* Turnstile Integration */}
          <div className="flex justify-center py-2">
            <Turnstile
              siteKey="0x4AAAAAAC0n6ihaIamC4RCT"
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: "light" }}
            />
          </div>

          <div className="space-y-2">
            <Button 
              disabled={isSubmitting || !isValid || !turnstileToken} 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg disabled:opacity-30"
            >
              {isSubmitting ? "Processing..." : "Send Message"}
            </Button>

            {/* Validation Hint */}
            {(!turnstileToken || !isValid) && (
               <p className="text-center text-[9px] font-black uppercase text-indigo-400 tracking-widest animate-pulse flex items-center justify-center gap-1">
                <AlertCircle size={10} /> 
                {!turnstileToken ? "Security check required" : "Complete the form"}
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}