import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

import headerImage from "@/../public/headerImage.svg";
import ArrowM from '@/../public/Arrow15.svg';
import ArrowB from '@/../public/Arrow2.svg';
import star1 from '@/../public/star1.svg';
import star2 from '@/../public/star2.svg';
import car from '@/../public/car.svg';
import computer from '@/../public/computer.svg';
import aboutStar from '@/../public/aboutStar.svg';
import chooseStar from '@/../public/chooseStar.svg';
import setUsersLastViewed from '@/utils/setUsersLastViewed.utils';

export default function Home() {
  setUsersLastViewed(`/home`)
  
  return (
    <div className="relative w-full  bg-[#F5F7FA] flex flex-col items-center justify-center">
      <img className="mt-5 ml-4" src={headerImage.src} alt="header image" />
      <div className="flex flex-col items-center justify-center mt-5 play-font text-center">
        <h3 className="text-neutral-500 font-bold text-l mb-1">Introducing Labchat: An LMS for universities</h3>
        <h2 className="text-black font-bold text-4xl">Streamlining labs to <span className="text-[#244394] font-bold text-4xl">empower research</span></h2>
      </div>
      <div className="relative flex flex-col items-center justify-center">
        <div className="flex justify-start mt-5 play-font">
           <Link href={"../login"}><Button className="bg-[#284AA3] text-white font-medium ml-0 py-3  hover:bg-blue-300 transition duration-300"><span className="pr-18">Login</span> <ArrowRight className="w-4 h-4" /></Button></Link>
           <Link href={"../register"}><Button className="bg-white text-neutral-800 font-medium py-2 ml-4  border border-neutral-800 hover:bg-blue-800 hover:text-white transition duration-300"> <span className="pr-6">Register</span> <ArrowRight className="w-4 h-4" /> </Button></Link>
        </div>
        <div className="flex justify-start mt-7 barlow-font text-xs">
          <div className="relative">
            <img src={ArrowM.src} alt="Magenta Arrow" className="absolute " />
            <img src={ArrowB.src} alt="Blue Arrow" className="absolute bottom-[0px] right-[0px]" />
            <img src={star1.src} alt="Star 1" className="absolute bottom-[0px] right-[0px]" />
            <img src={star2.src} alt="Star 2" className="absolute bottom-[0px] right-[0px]" />
          </div>
          <h4 className="text-pink-600 ml-9">Stop wasting time with outdated processes and use Labchat today!</h4>
          <h4 className="text-blue-800 mr-8">Want to start saving time? Signup today!</h4>
        </div>
      </div>
    
      <div className="flex flex-col items-center justify-center mt-7">
        <img src={aboutStar.src} alt="Star" />
        <h2 className="text-black font-bold text-4xl play-font">About Labchat</h2>
        <h3 className="text-neutral-500 font-bold text-l mb-5 play-font">Reclaiming time, empowering science.</h3>
        <p className="text-neutral-800 font-barlow text-xs text-left ml-5 mr-5">At LabChat, we believe labs should be hubs of innovation—not bogged down by inefficiencies. Our platform centralises lab flows into one seamless hub, eliminating the chaos of scattered communications, inventory mishaps, and scheduling conflicts. With LabChat, researchers reclaim valuable hours lost to outdated processes, enabling them to focus on groundbreaking discoveries.
        <br></br> <br></br>Built with input from real lab users, LabChat transforms lab management by integrating discussion boards, inventory tracking, and an automated scheduling system. It’s the smart, user-centric solution designed to bring clarity and efficiency to every lab.
        </p>
      </div>

      <div className="bg-[#1C1E26] rounded-lg w-[300px] h-[120px] shadow-neutral-600 mt-10 items-center justify-center">
        <div className="flex flex-row items-center justify-center text-white gap-x-20 mt-10">
          <h2 className=" font-bold text-2xl barlow-font">#</h2>
          <h2 className=" font-bold text-2xl barlow-font">#</h2>
          <h2 className=" font-bold text-2xl barlow-font">#</h2>
        </div>
        <div className="flex flex-row items-center justify-center text-neutral-400 font-medium text-xs barlow-font gap-x-6">
          <h2>Hours Saved</h2>
          <h2>Labs Deployed</h2>
          <h2>Universities </h2>
        </div>
      </div>
      <img  className="mt-10" src={chooseStar.src} alt="Star" />
      <h2 className="mt-3 play-font font-bold text-4xl">Why choose us?</h2>
      <div className="bg-white border-gray-400 rounded-lg w-[250px] h-[250px] shadow-neutral-600 shadow-2xs mt-5 flex flex-col items-center justify-center">
        <img src={car.src} alt="car" />
        <h3 className="text-blue-800 font-play text-xl font-bold">Efficient</h3>
        <p className="text-neutral-800 font-barlow text-xs text-center mt-2 ml-10 mr-10">Streamlines every step of the process, saving you time and resources.</p>
      </div>

      <div className="bg-white border-gray-400 rounded-lg w-[250px] h-[250px] shadow-neutral-600 shadow-2xs mt-5 flex flex-col items-center justify-center">
        <img src={computer.src} alt="computer" />
        <h3 className="text-blue-800 font-play text-xl font-bold">Interactive</h3>
        <p className="text-neutral-800 font-barlow text-xs text-center mt-2 ml-10 mr-10">Instant access to your lab inventory: anytime, anywhere, any device.</p>
      </div>
  </div>
  );
}


