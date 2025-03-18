'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok } from 'react-icons/fa';

export default function Home() {
  
  return (
    <div className="bg-theme-bg h-screen overflow-hidden">
      <div className="relative isolate px-6 pt-14 lg:px-8 h-full">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-primary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-theme-fg sm:text-6xl">
              Track your workouts with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-theme-fg opacity-80">
              GymMentor uses AI to understand your workout descriptions and track your progress over time.
              Simply describe your workout in natural language, and let our AI do the rest.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/log"
                className="rounded-md bg-gradient-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gradient-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Log a Workout
              </Link>
              <Link href="/visualization" className="text-sm font-semibold leading-6 text-primary">
                View your progress <span aria-hidden="true">→</span>
              </Link>
            </div>
            
            {/* Social Media Icons */}
            <div className="mt-8 flex justify-center space-x-6">
            <a href="https://www.tiktok.com/@gymmentorai" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-primary">
                <FaTiktok className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">TikTok</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-primary">
                <FaFacebook className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com/gymmentorai" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-primary">
                <FaTwitter className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com/gymmentorai" target="_blank" rel="noopener noreferrer" className="text-theme-fg hover:text-primary">
                <FaInstagram className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-primary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>
    </div>
  );
}
