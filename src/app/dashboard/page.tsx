
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GalleryItem } from '@/components/gallery-item';
import type { Creation as GalleryCreation } from '@/app/gallery/page'; // Renaming to avoid conflict
import { HeaderLogoIcon } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
    GalleryThumbnails, 
    Home, 
    LayoutGrid, 
    Sparkles,
    Image as ImageIcon,
    Building,
    ArrowRight
} from 'lucide-react';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

// This type represents the user's private design history
export type Design = {
  id: string;
  created_at: string;
  original_image_url: string;
  generated_image_url: string;
  style: string;
  room_type: string | null;
};

async function getDesignsForUser(userId: string): Promise<Design[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('designs') // Fetching from the new 'designs' table
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user designs:', error);
        return [];
    }
    return data || [];
}

const StatCard = ({ title, value, icon: Icon, linkText }: { title: string, value: string | number, icon: React.ElementType, linkText?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {linkText && <p className="text-xs text-muted-foreground">{linkText}</p>}
        </CardContent>
    </Card>
);

const QuickActionCard = ({ title, description, href, icon: Icon }: { title: string, description: string, href: string, icon: React.ElementType }) => (
    <Link href={href} className="block group">
        <Card className="hover:border-primary transition-colors h-full">
            <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="bg-secondary p-3 rounded-full">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
            </CardContent>
        </Card>
    </Link>
);


export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const designs = await getDesignsForUser(user.id);
    const recentDesigns = designs.slice(0, 5);

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <HeaderLogoIcon />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto sidebar-scroll">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-primary transition-all hover:text-primary"
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/generate"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Home className="h-4 w-4" />
                                New Interior Design
                            </Link>
                            <Link
                                href="/exterior"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Building className="h-4 w-4" />
                                New Exterior Design
                            </Link>
                             <Link
                                href="/gallery"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <GalleryThumbnails className="h-4 w-4" />
                                Gallery
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t">
                       <UserNav user={user} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <div className="md:hidden">
                        <Link href="/dashboard">
                            <HeaderLogoIcon />
                        </Link>
                    </div>
                    <div className="w-full flex-1">
                         {/* Can be used for a search bar later */}
                    </div>
                    <ThemeSwitcher />
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-8 bg-muted/40 overflow-y-auto">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {user.user_metadata.name || user.email}! Here's your creative overview.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Designs" value={designs.length} icon={ImageIcon} />
                        <StatCard title="Interior Designs" value={designs.filter(d => d.room_type).length} icon={Home} />
                        <StatCard title="Exterior Designs" value={designs.filter(d => !d.room_type).length} icon={Building} />
                        <StatCard title="Daily Limit" value={`${(designs.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString())).length} / 20`} icon={Sparkles} linkText="Resets daily" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
                        <div className="grid gap-4 mt-4 md:grid-cols-2">
                             <QuickActionCard 
                                title="Design an Interior"
                                description="Upload a room photo and transform it with AI."
                                href="/generate"
                                icon={Home}
                            />
                            <QuickActionCard 
                                title="Redesign an Exterior"
                                description="Restyle a house facade, garden, or patio."
                                href="/exterior"
                                icon={Building}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
                             {designs.length > 5 && (
                                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                                    View all
                                </Link>
                             )}
                        </div>
                         {recentDesigns.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl mt-4">
                                <h3 className="text-xl font-semibold text-foreground">No Designs Yet</h3>
                                <p className="mt-1 text-muted-foreground">Start creating to see your recent activity here.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/generate">Create your first design <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                </Button>
                            </div>
                        ) : (
                            <Card className="mt-4">
                                <CardContent className="p-0">
                                   <div className="divide-y">
                                     {recentDesigns.map((design, index) => (
                                        <div key={design.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                                            <div className="flex items-center gap-4">
                                                <img src={design.generated_image_url} alt={design.style} className="h-12 w-12 rounded-md object-cover"/>
                                                <div>
                                                    <p className="font-semibold capitalize">{design.style} {design.room_type || 'Exterior'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Created {formatDistanceToNow(new Date(design.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={design.room_type ? "secondary" : "outline"} className="capitalize">
                                                {design.room_type ? "Interior" : "Exterior"}
                                            </Badge>
                                        </div>
                                     ))}
                                   </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
