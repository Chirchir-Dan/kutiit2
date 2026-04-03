"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "General Inquiry",
      message: "",
      honeyPot: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Message received! We'll get back to you soon.");
        reset();
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
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-10 bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">
            Contact Kutiit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Honeypot - Hidden from humans */}
          <input {...register("honeyPot")} className="hidden" tabIndex={-1} />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <Input {...register("name")} placeholder="e.g. Kipchoge" className="rounded-xl bg-slate-50 border-none h-12" />
            {errors.name && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
            <Input {...register("email")} type="email" placeholder="your@email.com" className="rounded-xl bg-slate-50 border-none h-12" />
            {errors.email && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                <div className="relative">
                    <select 
                    {...register("subject")}
                    className="w-full rounded-xl bg-slate-50 h-12 px-4 text-sm border-none focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer text-slate-700 font-medium"
                    >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Language Lessons">Language Lessons</option>
                    <option value="Project Feedback">Project Feedback</option>
                    <option value="Partnership">Partnership</option>
                    </select>
                    {/* Custom Arrow Icon */}
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    </div>
                </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
            <Textarea {...register("message")} placeholder="How can we help?" className="rounded-xl bg-slate-50 border-none min-h-[100px]" />
            {errors.message && <p className="text-[9px] text-red-500 font-bold uppercase ml-2">{errors.message.message}</p>}
          </div>

          <Button 
            disabled={isSubmitting} 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all mt-2 shadow-lg"
          >
            {isSubmitting ? "Processing..." : "Send Message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}