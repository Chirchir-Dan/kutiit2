"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"; // Added CheckCircle2

export function ContactModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New Success State
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "all",
    defaultValues: {
      name: "",
      email: "",
      subject: "General Inquiry",
      message: "",
      honeyPot: "",
      turnstileToken: "",
    },
  });

  useEffect(() => {
    if (open) {
      trigger();
      setIsSuccess(false); // Reset success state whenever modal opens
    }
  }, [open, trigger]);

  const onSubmit = async (data: ContactFormValues) => {
    if (data.honeyPot) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setIsSuccess(true); // Trigger the "Thank You" view
        reset();
        setTurnstileToken(null);
        
        // Delay closing the modal for 2 seconds
        setTimeout(() => {
          setOpen(false);
        }, 2500);
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[450px] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 bg-white border-none shadow-2xl overflow-y-auto overflow-x-hidden max-h-[90vh] flex flex-col [&>button]:top-8 [&>button]:right-8 [&>button]:opacity-40 [&>button:hover]:opacity-100 transition-opacity">
        
        {/* Conditional Rendering: Success Message vs Form */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-50 p-4 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900">
                Message Sent!
              </h3>
              <p className="text-sm font-medium text-slate-500 max-w-[250px]">
                Thank you for contacting Kutiit. We&apos;ll get back to you shortly.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900">
                Contact Kutiit
              </DialogTitle>
              <VisuallyHidden.Root>
                <DialogDescription>Inquiry form</DialogDescription>
              </VisuallyHidden.Root>
            </DialogHeader>

            <form 
              onSubmit={handleSubmit(onSubmit, (err) => console.log("Validation Errors:", err))} 
              className="space-y-4 mt-2 w-full max-w-full"
            >
              <input {...register("honeyPot")} className="hidden" tabIndex={-1} />
              <input {...register("turnstileToken")} className="hidden" />

              <div className="space-y-1 w-full min-w-0">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <Input {...register("name")} placeholder="e.g. Kipkosgei Dan" className="w-full rounded-xl bg-slate-50 border-none h-11 text-sm focus-visible:ring-emerald-500" />
                {errors.name && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.name.message}</p>}
              </div>

              <div className="space-y-1 w-full min-w-0">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                <Input {...register("email")} type="email" placeholder="your@email.com" className="w-full rounded-xl bg-slate-50 border-none h-11 text-sm focus-visible:ring-emerald-500" />
                {errors.email && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.email.message}</p>}
              </div>

              <div className="space-y-1 w-full min-w-0">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                <div className="relative w-full">
                  <select 
                    {...register("subject")}
                    className="w-full rounded-xl bg-slate-50 h-11 px-4 text-sm border-none focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer text-slate-700 font-medium shadow-sm"
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
                <Textarea {...register("message")} placeholder="How can we help?" className="w-full rounded-xl bg-slate-50 border-none min-h-[80px] text-sm focus-visible:ring-emerald-500 shadow-sm" />
                {errors.message && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.message.message}</p>}
              </div>

              <div className="w-full flex justify-center overflow-hidden py-2">
                <div className="scale-75 xs:scale-90 sm:scale-100 origin-center">
                  <Turnstile
                    siteKey="0x4AAAAAAC0n6ihaIamC4RCT"
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setValue("turnstileToken", token, { shouldValidate: true });
                    }}
                    onExpire={() => {
                      setTurnstileToken(null);
                      setValue("turnstileToken", "", { shouldValidate: true });
                    }}
                    options={{ theme: "light" }}
                  />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Button 
                  disabled={isSubmitting || !turnstileToken} 
                  type="submit" 
                  className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>

                {(!turnstileToken || Object.keys(errors).length > 0) && (
                  <p className="text-center text-[9px] font-black uppercase text-indigo-400 tracking-widest animate-pulse flex items-center justify-center gap-1">
                    <AlertCircle size={10} /> 
                    {!turnstileToken ? "Security check required" : "Check highlighted fields"}
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}