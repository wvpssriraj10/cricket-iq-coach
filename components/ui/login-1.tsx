'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import Image from 'next/image';
import { Github, Mail, Twitter, Loader2, Eye, EyeOff } from 'lucide-react';
import { login, signup } from '@/app/login/actions';
import { createClient } from '@/utils/supabase/client';

interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  [key: string]: any;
}

const AppInput = (props: InputProps) => {
  const { label, placeholder, icon, ...rest } = props;
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full min-w-[200px] relative">
      { label &&
        <label className='block mb-2 text-sm font-medium text-[var(--color-text-secondary)]'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          className="peer relative z-10 h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] px-4 text-sm outline-none transition-all duration-200 placeholder:text-[var(--color-text-secondary)]/50 focus:border-primary/50 focus:bg-[var(--color-bg)] focus:ring-2 focus:ring-primary/10"
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-[var(--color-text-secondary)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

const Login1 = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isSignUp ? await signup(formData) : await login(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  const handleOAuth = async (provider: string) => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const socialIcons = [
    {
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      ),
      href: '#',
      gradient: 'bg-[var(--color-bg)]',
      provider: 'google',
    }
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className='relative w-full max-w-5xl flex rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-surface)]/80 backdrop-blur-xl overflow-hidden shadow-2xl'>
        <div
          className='w-full lg:w-1/2 px-8 lg:px-12 py-12 relative overflow-hidden'
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-br from-primary/10 via-accent/10 to-transparent rounded-full blur-3xl transition-opacity duration-500 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
              transition: 'transform 0.15s ease-out'
            }}
          />
          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/30">
                  <Image src="/logo.png" alt="" fill className="object-contain" sizes="40px" />
                </span>
                <span className="text-lg font-bold text-[var(--color-heading)]">Cricket IQ</span>
              </div>
              <h1 className="text-3xl font-bold text-[var(--color-heading)]">
                {isSignUp ? 'Create Account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {isSignUp
                  ? 'Start tracking your cricket coaching journey.'
                  : 'Sign in to your account to continue.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <AppInput placeholder="Email" type="email" name="email" required />
                <div className="relative">
                  <AppInput
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    icon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">I am a:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="role" value="player" defaultChecked className="sr-only peer" />
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-border)] peer-checked:border-primary peer-checked:bg-primary/20 transition-colors">
                          <span className="h-2 w-2 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
                        </span>
                        <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-heading)] transition-colors">Player</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="role" value="coach" className="sr-only peer" />
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-border)] peer-checked:border-primary peer-checked:bg-primary/20 transition-colors">
                          <span className="h-2 w-2 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
                        </span>
                        <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-heading)] transition-colors">Coach</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm text-destructive">{errorMsg}</p>
                </div>
              )}

              {!isSignUp && (
                <div className="text-right">
                  <a href="#" className='text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-heading)] transition-colors'>Forgot password?</a>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full inline-flex justify-center items-center overflow-hidden rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </span>
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                  <div className="relative h-full w-8 bg-white/10" />
                </div>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[var(--color-surface)] px-4 text-[var(--color-text-secondary)]">or continue with</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {socialIcons.map((social, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleOAuth(social.provider)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-muted-surface)] text-[var(--color-text-secondary)] transition-all hover:border-primary/40 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] hover:shadow-md"
                  >
                    {social.icon}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-[var(--color-text-secondary)]">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </form>
          </div>
        </div>

        <div className='hidden lg:block w-1/2 relative overflow-hidden bg-gradient-to-br from-black to-neutral-900'>
          <Image
            src='https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop'
            width={1000}
            height={1000}
            priority
            alt="Cricket stadium"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/40">
                <Image src="/logo.png" alt="" fill className="object-contain" sizes="40px" />
              </span>
              <h2 className="text-2xl font-bold text-white">Cricket IQ Coach</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Unlock advanced insights, track performance, and elevate your cricket coaching with data-driven analytics.
            </p>
            <div className="mt-6 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Smart Analytics
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                AI Insights
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Player Tracking
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login1;
