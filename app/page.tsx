import { Appbar } from "@/components/Appbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Users, Radio, Headphones } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
        <Appbar/>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Create, Join, and Vibe
          </span>
        </h1>
        <p className="mb-8 text-xl text-gray-300">
          Stream music together in virtual spaces. Share your favorite tunes and
          discover new ones.
        </p>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Music className="h-12 w-12 text-purple-400" />}
              title="Create Spaces"
              description="Set up your own music room and invite friends to join."
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-pink-400" />}
              title="Collaborative Playlists"
              description="Build playlists together in real-time."
            />
            <FeatureCard
              icon={<Radio className="h-12 w-12 text-green-400" />}
              title="Live DJ Sessions"
              description="Take turns being the DJ and control the music."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-4xl font-bold">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <StepCard
            number="1"
            title="Create a Space"
            description="Set up your virtual music room in seconds."
          />
          <StepCard
            number="2"
            title="Invite Friends"
            description="Share your space code or link with others."
          />
          <StepCard
            number="3"
            title="Start Streaming"
            description="Play music and enjoy together!"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-800 to-pink-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-4xl font-bold">
            Ready to Start Your Musical Journey?
          </h2>
          <div className="flex justify-center space-x-4">
            <Input
              className="max-w-xs bg-white text-gray-900"
              placeholder="Enter your email"
              type="email"
            />
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} MusicSpace. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-lg bg-gray-700 p-6 text-center shadow-lg transition-transform hover:scale-105">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="relative rounded-lg bg-gray-800 p-6 text-center shadow-lg">
      <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-xl font-bold text-gray-900">
        {number}
      </div>
      <h3 className="mb-2 mt-4 text-xl font-semibold">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
