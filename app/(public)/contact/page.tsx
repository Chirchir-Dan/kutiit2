// app/(public)/contact/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-20 px-6 w-full">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Get in Touch</h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Have questions about the project or want to book lessons?
        </p>
      </div>

      <form className="space-y-6 bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
          <Input placeholder="John Doe" className="rounded-xl border-slate-200 h-12 focus:ring-emerald-500" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
          <Input type="email" placeholder="john@example.com" className="rounded-xl border-slate-200 h-12" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Inquiry Type</label>
          <select className="w-full rounded-xl border border-slate-200 h-12 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>General Inquiry</option>
            <option>Language Lessons</option>
            <option>Project Feedback</option>
            <option>Partnership</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
          <Textarea placeholder="How can we help you?" className="rounded-2xl border-slate-200 min-h-[150px]" />
        </div>

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-100 transition-all">
          Send Message
        </Button>
      </form>
    </div>
  );
}