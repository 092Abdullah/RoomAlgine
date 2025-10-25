
import LandingPage from "@/components/landing-page";

export default async function Home() {
  // No user object is needed anymore
  return <LandingPage user={null} />;
}
