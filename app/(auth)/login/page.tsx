"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Added for navigation
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter // Added for the bottom link
} from "@/components/ui/card";
import { Loader2, Lock, Mail, ArrowLeft } from "lucide-react"; // Added ArrowLeft

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-50 p-4">
      
      {/* TOP LEFT BACK BUTTON */}
      <div className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" asChild className="text-slate-500 hover:text-emerald-700 transition-colors group">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dictionary
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-200 bg-white/80 backdrop-blur">
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="mx-auto bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-2">
            <Lock className="text-emerald-600 h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Kutiit Admin
          </CardTitle>
          <CardDescription className="font-medium">
            Authorization required to manage entries
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@kutiit.com"
                  className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-500/20"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-500/20"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-black h-12 rounded-xl font-bold uppercase text-xs tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] mt-2" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                "Enter Dashboard"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pb-8 pt-2 flex justify-center">
           <Link href="/" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
             Cancel and return to public site
           </Link>
        </CardFooter>
      </Card>
    </div>
  );
}