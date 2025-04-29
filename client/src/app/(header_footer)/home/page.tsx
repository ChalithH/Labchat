import Link from 'next/link';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

import headerImage from "@/../public/headerImage.svg";
import car from '@/../public/car.svg';
import computer from '@/../public/computer.svg';
import aboutStar from '@/../public/aboutStar.svg';
import chooseStar from '@/../public/chooseStar.svg';
import setUsersLastViewed from '@/utils/setUsersLastViewed.utils';
import star1 from '@/../public/star1.svg';
import star2 from '@/../public/star2.svg';

export default function Home() {
  setUsersLastViewed(`/home`)
  
  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section id='home' className="flex flex-col lg:flex-row items-center w-full max-w-7xl px-0 lg:px-8 pt-8 lg:pt-12 gap-8 lg:gap-12">
        <div id='hero-image' className="w-full lg:w-1/2 flex justify-center px-8 lg:pr-32 lg:pl-0">
          <Image 
            src={headerImage} 
            alt="header image" 
            priority
            className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[550px] xl:max-w-[600px]"
          />
        </div>
        <div id='hero-blurb' className="w-full lg:w-1/2 px-8 lg:px-0">
          <div className="flex flex-col items-center lg:items-start justify-center play-font text-center lg:text-left">
            <h3 className="text-zinc-600 dark:text-zinc-300 font-bold text-xl md:text-2xl lg:text-2xl mb-1 lg:mb-3">Introducing Labchat: An LMS for universities</h3>
            <h2 className="text-zinc-900 dark:text-zinc-100 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">Streamlining labs to <br className="hidden lg:block" /> <span className="text-labchat-blue-500 font-bold">empower research</span></h2>
          </div>
          <div className="relative flex flex-col items-center justify-center w-full mt-8">
            <div className="flex flex-row justify-center items-start w-full gap-4 sm:gap-8">
              <div className="flex flex-col items-center w-full max-w-[160px] sm:max-w-xs">
                <Link href={"../login"} className="w-full">
                  <Button className="bg-labchat-magenta-500 text-zinc-50 font-medium py-3 px-4 sm:px-6 w-full justify-between text-sm sm:text-base hover:bg-labchat-magenta-300 transition duration-300 rounded">
                    <span>Login</span> <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
                <div className="flex items-start mt-2 sm:mt-4">
                  <Image src={star1} alt="Star" width={16} height={16} className="mr-1 sm:mr-2 flex-shrink-0 mt-1" />
                  <p className="text-labchat-magenta-500 text-xs sm:text-sm font-medium">Stop wasting time with outdated processes and use Labchat today!</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center w-full max-w-[160px] sm:max-w-xs">
                <Link href={"../register"} className="w-full">
                  <Button className="bg-labchat-blue-500 text-zinc-50 font-medium py-3 px-4 sm:px-6 w-full justify-between text-sm sm:text-base border hover:bg-blue-300 hover:text-zinc-700 transition duration-300 rounded">
                    <span>Register</span> <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
                <div className="flex items-start mt-2 sm:mt-4">
                  <Image src={star2} alt="Star" width={16} height={16} className="mr-1 sm:mr-2 flex-shrink-0 mt-1" />
                  <p className="text-labchat-blue-500 text-xs sm:text-sm font-medium">Already part of a lab? Signup today and start saving time!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* About Section */}
      <section id='about' className="flex flex-col items-center justify-center mt-16 w-full max-w-6xl px-4">
        <Image src={aboutStar} alt="Star" className="mb-4" />
        <h2 className="text-black font-bold text-4xl lg:text-5xl play-font">About Labchat</h2>
        <h3 className="text-neutral-500 font-bold text-l lg:text-xl mb-5 play-font text-center">Reclaiming time, empowering science.</h3>
        <p className="text-neutral-800 font-barlow text-xs md:text-sm lg:text-base text-left lg:text-center max-w-xs sm:max-w-md lg:max-w-3xl mx-auto">
          At LabChat, we believe labs should be hubs of innovation—not bogged down by inefficiencies. Our platform centralises lab flows into one seamless hub, eliminating the chaos of scattered communications, inventory mishaps, and scheduling conflicts. With LabChat, researchers reclaim valuable hours lost to outdated processes, enabling them to focus on groundbreaking discoveries.
          <br /><br />
          Built with input from real lab users, LabChat transforms lab management by integrating discussion boards, inventory tracking, and an automated scheduling system. It&apos;s the smart, user-centric solution designed to bring clarity and efficiency to every lab.
        </p>
      </section>

      {/* Stats Section */}
      <section id='stats' className="mt-16 w-full max-w-6xl px-4">
        <div className="bg-[#1C1E26] rounded-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto py-6 px-4 shadow-lg">
          <div className="flex flex-row items-center justify-center text-white gap-x-12 md:gap-x-24 lg:gap-x-32">
            <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl barlow-font">#</h2>
            <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl barlow-font">#</h2>
            <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl barlow-font">#</h2>
          </div>
          <div className="flex flex-row items-center justify-center text-neutral-400 font-medium text-xs md:text-sm barlow-font gap-x-4 md:gap-x-8 lg:gap-x-12 mt-2">
            <h2>Hours Saved</h2>
            <h2>Labs Deployed</h2>
            <h2>Universities</h2>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id='choose' className="mt-16 w-full max-w-6xl px-4 pb-16">
        <div className="flex flex-col items-center">
          <Image src={chooseStar} alt="Star" className="mb-4" />
          <h2 className="play-font font-bold text-4xl lg:text-5xl mb-8">Why choose us?</h2>
          
          <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
            <div className="bg-white border border-gray-300 rounded-lg w-full md:w-1/2 max-w-xs shadow-md p-6 flex flex-col items-center justify-center">
              <Image src={car} alt="car" className="mb-4 w-16 h-16" />
              <h3 className="text-blue-800 font-play text-xl font-bold">Efficient</h3>
              <p className="text-neutral-800 font-barlow text-xs md:text-sm text-center mt-2">
                Streamlines every step of the process, saving you time and resources.
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg w-full md:w-1/2 max-w-xs shadow-md p-6 flex flex-col items-center justify-center">
              <Image src={computer} alt="computer" className="mb-4 w-16 h-16" />
              <h3 className="text-blue-800 font-play text-xl font-bold">Interactive</h3>
              <p className="text-neutral-800 font-barlow text-xs md:text-sm text-center mt-2">
                Instant access to your lab inventory: anytime, anywhere, any device.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}