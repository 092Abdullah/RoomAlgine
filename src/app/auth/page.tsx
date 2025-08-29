
'use client';
import { useState, useTransition } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { AuthButton } from '@/components/auth-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signInWithEmail, signUpWithEmail } from '../actions';
import { Separator } from '@/components/ui/separator';

type AuthView = 'login' | 'signup';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const initialView = (searchParams.get('view') as AuthView) || 'login';
    const [view, setView] = useState<AuthView>(initialView);
    const [isPending, startTransition] = useTransition();

    const handleFormAction = (action: (formData: FormData) => Promise<{ error?: string; success?: boolean; message?: string }>) => {
        return async (formData: FormData) => {
            startTransition(async () => {
                const result = await action(formData);
                if (result.error) {
                    toast.error('Authentication Failed', { description: result.error });
                } else if (result.success && result.message) {
                    toast.success('Check your email!', { description: result.message });
                    setView('login'); // Switch to login view after successful signup
                } else {
                    // Successful login is handled by the AuthWatcher, which will redirect.
                    toast.success('Login successful!');
                }
            });
        };
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Card className="w-full max-w-sm shadow-xl">
                 <CardHeader className="text-center space-y-4">
                    <Link href="/" className="inline-block mx-auto">
                        <HeaderLogoIcon />
                    </Link>
                    <div>
                        <CardTitle>Welcome to RoomAIgine</CardTitle>
                        <CardDescription>
                            {view === 'login' ? 'Sign in to unlock your creative potential' : 'Create an account to get started'}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                    <AuthButton />
                    <div className="flex items-center gap-4">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                    </div>

                    {view === 'login' ? (
                        <form action={handleFormAction(signInWithEmail)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="text-sm text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>
                             <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>
                    ) : (
                        <form action={handleFormAction(signUpWithEmail)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required minLength={6}/>
                            </div>
                             <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="px-6 pb-6">
                    {view === 'login' ? (
                        <p className="text-sm text-center w-full text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <button onClick={() => setView('signup')} className="text-primary font-semibold hover:underline">
                                Sign Up
                            </button>
                        </p>
                    ) : (
                        <p className="text-sm text-center w-full text-muted-foreground">
                            Already have an account?{' '}
                            <button onClick={() => setView('login')} className="text-primary font-semibold hover:underline">
                                Sign In
                            </button>
                        </p>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
