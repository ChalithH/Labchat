import Image from 'next/image';
import Link from 'next/link';
import frank from '../../../public/frank.svg';
import back from '../../../public/door-closed.svg';
import dnaBanner from '../../../public/dna-upper-right-banner.svg';

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

      <div className="mb-6 flex justify-center w-full z-10">
        <Image 
          src={frank}   
          alt="Labchat Logo"
          width={logoWidth}
          height={logoHeight}
          className="object-contain"
          style={{ height: 'auto', width: 'auto' }}
        />
      </div>
      
      <h1 className="text-[#284AA3] text-4xl font-bold font-play w-full text-center z-10"> {/* Added z-10 */}
        Labchat
      </h1>
      
      {subtitle && (
        <h2 className="font-play font-bold text-[#1C1E26] text-2xl mt-4 w-full text-center z-10"> {/* Added z-10 */}
          {subtitle}
        </h2>
      )}
    </div>
  );
};