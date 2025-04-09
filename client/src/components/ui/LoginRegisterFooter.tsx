import Image from 'next/image';
import Link from 'next/link';
import dnaBanner from '../../../public/dna-bottom-left-banner.svg';
import waveBanner from '../../../public/wave-bottom-right-banner.svg';

interface LoginRegisterFooterProps {
  pageType: 'login' | 'register';
}

export const LoginRegisterFooter = ({ pageType }: LoginRegisterFooterProps) => {
  return (
    <div className="w-full mt-8 relative">
      <div className="w-[calc(100%-0.5rem)] mx-auto h-px bg-gray-300 mb-6"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center text-sm">
          {pageType === 'login' ? (
            <>
              <Link href="/forgot-password" className="text-[#C13E70] hover:text-[#A83762]">
                Forgot password?
              </Link>
              <div className="text-right">
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/register" className="font-bold text-[#C13E70] hover:text-[#A83762]">
                  Sign up
                </Link>
              </div>
            </>
          ) : (
            <div className="w-full text-right">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/login" className="font-bold text-[#C13E70] hover:text-[#A83762]">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full h-20 mt-8">
        <div className="absolute left-0 bottom-0 z-0 opacity-80 translate-y-4">
          <Image
            src={dnaBanner}
            alt="DNA Banner"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

        <div className="absolute right-0 bottom-0 z-0 opacity-80 translate-y-4">
          <Image
            src={waveBanner}
            alt="Wave Banner"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};