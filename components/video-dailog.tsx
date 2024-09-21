import HeroVideoDialog from "@/components/magicui/hero-video-dialog";

export function VideoDialog() {
  return (
    <div className="relative">
      <HeroVideoDialog
        className="dark:hidden block"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/watch?v=GLJ-AOVEQ4E&t=3s"
        thumbnailSrc="/view.png"
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/watch?v=GLJ-AOVEQ4E&t=3s"
        thumbnailSrc="/view.png"
        thumbnailAlt="Hero Video"
      />
    </div>
  );
}
