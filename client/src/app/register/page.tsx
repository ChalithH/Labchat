import { LoginRegisterHeader } from '@/components/ui/LoginRegisterHeader';
import { LoginRegisterFooter } from '@/components/ui/LoginRegisterFooter';


export default function Register() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#739CEA]">
      <div className="w-full max-w-md space-y-6 rounded-xl">
        <LoginRegisterHeader 
          subtitle="Register"
          className="mb-8"
        />

        <form className="space-y-5 p-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white">
                First name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-400"
                placeholder="First name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white">
                Last name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-400"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-400"
              placeholder="Enter your email"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-400"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-400"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#C13E70] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#A83762] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors duration-200 mt-6"
          >
            Register
          </button>
        </form>
        
        <LoginRegisterFooter pageType="register" />
      </div>
    </div>
  );
}