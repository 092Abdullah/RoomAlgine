
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { updateUserAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';

export function SettingsForm({ user }: { user: User }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.user_metadata.avatar_url);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('File too large', { description: 'Please select an image under 2MB.' });
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setShouldRemoveAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setShouldRemoveAvatar(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
    
    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData(event.currentTarget);

        try {
            if (avatarFile) {
                const avatarDataUri = await fileToDataUri(avatarFile);
                formData.append('avatarDataUri', avatarDataUri);
            } else if (shouldRemoveAvatar) {
                formData.append('removeAvatar', 'true');
            }

            const result = await updateUserAction(formData);

            if (result.success) {
                toast.success('Profile updated successfully!');
                router.refresh(); 
            } else {
                toast.error('Update failed', { description: result.error });
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name?: string, email?: string) => {
        if (name) {
            const names = name.split(' ');
            if (names.length > 1) {
                return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }
        if (email) {
            return email.substring(0, 2).toUpperCase();
        }
        return '??';
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your avatar. We support PNG, JPEG under 2MB.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarPreview ?? undefined} alt="User avatar" />
                        <AvatarFallback>{getInitials(user.user_metadata.full_name, user.email)}</AvatarFallback>
                    </Avatar>
                     <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            Change Image
                        </Button>
                        {avatarPreview && (
                            <Button type="button" variant="ghost" onClick={handleRemoveAvatar} disabled={!avatarPreview}>
                                Remove
                            </Button>
                        )}
                        <Input
                            ref={fileInputRef}
                            type="file"
                            name="avatar"
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Info</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={user.user_metadata.full_name || ''}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user.email || ''}
                            disabled
                        />
                         <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6 flex justify-end">
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
