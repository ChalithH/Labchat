import Link from 'next/link';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

import headerImage from "@/../public/headerImage.svg";
import setUsersLastViewed from '@/lib/set_last_viewed';

export default function Home() {
  setUsersLastViewed(`/home`)
  
  return (
    <div className="relative min-h-[85.7vh] w-full flex flex-col items-center justify-center bg-[url(/lightBackground.png)] bg-no-repeat bg-cover dark:bg-[url(/darkBackground.png)] text-zinc-900 dark:text-zinc-100">
      
      {/* Hero Section */}
      <section id='home' className="flex flex-col lg:flex-row items-center w-full container mx-auto px-0 py-7 lg:px-8 gap-8 lg:gap-12">
        <div id='hero-image' className="w-full max-w-3xl flex justify-center px-8 lg:pr-32 lg:pl-0">
          <Image 
            src={headerImage} 
            alt="header image" 
            priority
            className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[500px] xl:max-w-[800px]"
          />
        </div>

        <div id='hero-blurb' className="w-full lg:w-1/2 px-8 lg:px-0">
          <div className="flex flex-col items-center lg:items-start justify-center play-font text-center lg:text-left">
            <h3 className="text-labchat-blue-500 dark:text-labchat-light-blue-200 font-bold text-xl md:text-2xl lg:text-2xl mb-1 lg:mb-3">Introducing Labchat: An LMS for universities</h3>
            <h2 className="text-zinc-900 dark:text-zinc-100 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">Streamlining labs to <br className="hidden lg:block" /> <span className="text-labchat-magenta-500 font-bold">empower research</span></h2>
          </div>
          <div className="relative flex flex-col items-center justify-center w-full mt-8">
            <div className="flex flex-row justify-center items-start w-full gap-4 sm:gap-8">
              <div className="flex flex-col items-center w-full max-w-[160px] sm:max-w-xs">
                <Link href={"../login"} className="w-full">
                  <Button className="bg-labchat-magenta-500 text-zinc-50 font-medium py-5 px-4 sm:px-6 w-full justify-between text-sm sm:text-base hover:bg-labchat-magenta-400 hover:text-zinc-700 transition duration-300 rounded">
                    <span>Login</span> <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center w-full max-w-[160px] sm:max-w-xs">
                <Link href={"../register"} className="w-full">
                  <Button className="bg-zinc-900 dark:bg-zinc-50 text-labchat-magenta-500 font-medium py-5 px-4 sm:px-6 w-full justify-between text-sm sm:text-base hover:bg-labchat-magenta-500 hover:text-zinc-900 hover:dark:bg-labchat-magenta-500 hover:dark:text-zinc-50 transition duration-300 rounded">
                    <span>Register</span> <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className='text-labchat-blue-500 dark:text-labchat-light-blue-200 text-xl font-bold play-font justify-center flex flex-col items-center text-center mt-8'>
            <h2 className=''>In partnership with the University of Auckland</h2>
          </div>
        </div>
        
      </section>
    </div>
  );
}