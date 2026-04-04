"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/validation";
import { Turnstile } from "@marsidev/react-turnstile";
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
import { AlertCircle } from "lucide-react";

export function ContactModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      subject: "General Inquiry",
      message: "",
      honeyPot: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    if (data.honeyPot) return;
    if (!turnstileToken) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken }), 
      });
      if (response.ok) {
        reset();
        setTurnstileToken(null);
        setOpen(false);
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
      {/* CRITICAL FIX: 
          1. Changed w-[95vw] to max-w-[calc(100vw-2rem)] for safer padding.
          2. Added overflow-x-hidden to prevent any internal horizontal scaling.
      */}
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[450px] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 bg-white border-none shadow-2xl overflow-y-auto overflow-x-hidden max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900">
            Contact Kutiit
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>Inquiry form</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        {/* CRITICAL FIX: 
            Added 'w-full' and 'max-w-full' to the form to ensure it respects the modal width.
        */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2 w-full max-w-full">
          <input {...register("honeyPot")} className="hidden" tabIndex={-1} />

          <div className="space-y-1 w-full min-w-0">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <Input {...register("name")} placeholder="e.g. Kipchoge" className="w-full min-w-0 rounded-xl bg-slate-50 border-none h-11 shadow-sm text-sm" />
            {errors.name && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.name.message}</p>}
          </div>

          <div className="space-y-1 w-full min-w-0">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
            <Input {...register("email")} type="email" placeholder="your@email.com" className="w-full min-w-0 rounded-xl bg-slate-50 border-none h-11 shadow-sm text-sm" />
            {errors.email && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.email.message}</p>}
          </div>

          <div className="space-y-1 w-full min-w-0">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
            <div className="relative w-full">
              <select 
                {...register("subject")}
                className="w-full min-w-0 rounded-xl bg-slate-50 h-11 px-4 text-sm border-none focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer text-slate-700 font-medium shadow-sm"
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

          <div className="space-y-1 w-full min-w-0">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
            <Textarea {...register("message")} placeholder="How can we help?" className="w-full min-w-0 rounded-xl bg-slate-50 border-none min-h-[80px] shadow-sm text-sm" />
            {errors.message && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.message.message}</p>}
          </div>

          {/* TURNSTILE FIX:
              Forcing the container to be exactly the parent's width and centering.
          */}
          <div className="w-full flex justify-center overflow-hidden py-2">
            <div className="scale-75 xs:scale-90 sm:scale-100 origin-center">
              <Turnstile
                siteKey="0x4AAAAAAC0n6ihaIamC4RCT"
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                options={{ theme: "light" }}
              />
            </div>
          </div>

          <div className="space-y-2 w-full">
            <Button 
              disabled={isSubmitting || !isValid || !turnstileToken} 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg disabled:opacity-30"
            >
              {isSubmitting ? "Processing..." : "Send Message"}
            </Button>

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