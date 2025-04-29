import Image from 'next/image';
import Link from 'next/link';

import frank from '../../../public/frank.svg';
import back from '../../../public/door-closed.svg';
import dnaBanner from '../../../public/dna-upper-right-banner.svg';
import chooseStar from '../../../public/chooseStar.svg';
import largePinkStar from '../../../public/LargePinkStar.svg';
import aboutStar from '../../../public/aboutStar.svg';

interface LoginRegisterHeaderProps {
  subtitle?: string;
  logoWidth?: number;
  logoHeight?: number;
  className?: string;
  showBackButton?: boolean;
}

export const LoginRegisterHeader = ({
  subtitle = "Login",
  logoWidth = 150,
  logoHeight = 50,
  className = "",
  showBackButton = true
}: LoginRegisterHeaderProps) => {
  return (
    <div className={`relative flex flex-col items-center text-center ${className}`}>
      {/* Top-right DNA Banner */}
      <div className="absolute top-0 right-0 z-0 opacity-80">
        <Image
          src={dnaBanner}
          alt="DNA Banner"
          width={150}
          height={150}
          className="object-contain"
          style={{ height: 'auto', width: 'auto' }}
        />
      </div>

      {/* Back Button */}
      {showBackButton && (
        <div className="w-full flex justify-start mb-4 z-10">
          <Link
            href="/home"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-block"
            aria-label="Back to home"
          >
            <Image
              src={back}
              alt="Back"
              width={50}
              height={50}
              className="text-[#1C1E26] hover:text-[#284AA3]"
            />
          </Link>
        </div>
      )}

      {/* Logo and stars */}
      <div className="mb-6 w-full flex justify-center relative z-10">
        {/* Left side decorative stars */}
        <div className="absolute left-4 bottom-0 flex flex-col items-start">
          <Image
            src={largePinkStar}
            alt="Large Pink Star"
            width={40}
            height={40}
            className="mb-2 translate-x-6" 
            style={{ height: 'auto', width: 'auto' }}
          />
          <Image
            src={chooseStar}
            alt="Choose Star"
            width={30}
            height={30}
            className="translate-y-2"
            style={{ height: 'auto', width: 'auto' }}
          />
        </div>

        {/* Center logo */}
        <Image
          src={frank}
          alt="Labchat Logo"
          width={logoWidth}
          height={logoHeight}
          className="object-contain"
          style={{ height: 'auto', width: 'auto' }}
        />
      </div>

      {/* Title */}
      <div className="relative flex justify-center items-center z-10 mb-2">
        <h1 className="text-[#284AA3] text-4xl font-bold font-play text-center">
          Labchat
        </h1>

        {/* Right Star */}
        <div className="absolute left-1/2 translate-x-[500%] top-3/4 -translate-y-1/2">
          <Image
            src={aboutStar}
            alt="About Star"
            width={35}
            height={35}
            style={{ height: 'auto', width: 'auto' }}
          />
        </div>
      </div>

      {subtitle && (
        <h2 className="font-play font-bold text-[#1C1E26] text-2xl mt-4 w-full text-center z-10">
          {subtitle}
        </h2>
      )}
    </div>
  );
};