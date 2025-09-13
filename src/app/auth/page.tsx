
'use client';
import { Suspense } from 'react';
import { AuthButton } from '@/components/auth-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';

function AuthForm() {
    return (
        <Card className="w-full max-w-sm shadow-xl">
             <CardHeader className="text-center space-y-4">
                <Link href="/" className="inline-block mx-auto">
                    <HeaderLogoIcon />
                </Link>
                <div>
                    <CardTitle>Welcome to RoomAIgine</CardTitle>
                    <CardDescription>
                        Sign in to unlock your creative potential
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
                <AuthButton />
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Suspense fallback={<div>Loading...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    );
}
