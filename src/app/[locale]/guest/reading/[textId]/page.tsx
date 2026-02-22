import { GuestReader } from "@/components/onboarding/guest-reader";

interface GuestReadingPageProps {
  params: Promise<{
    textId: string;
  }>;
}

export default async function GuestReadingPage({
  params,
}: GuestReadingPageProps) {
  const { textId } = await params;

  return <GuestReader textId={textId} />;
}
