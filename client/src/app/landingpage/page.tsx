import Header from "./header";
import headerImage from "../../../public/headerImage.svg";
export default function Home() {
  return (
    <div>
      <Header />
      <img className="mt-5 ml-4" src={headerImage.src} alt="header image" />
      <div className="flex flex-col items-center justify-center mt-5 play-font text-center">
        <h3 className="text-neutral-500 font-bold text-l mb-1">Introducing Labchat: An LMS for universities</h3>
        <h2 className="text-black font-bold text-4xl">Streamlining labs to <span className="text-blue-800 font-bold text-4xl">empower research</span></h2>
      </div>
      <div className="flex justify-center mt-5">
          <button className="bg-blue-800 text-white font-bold py-2 px-4  hover:bg-blue-700 transition duration-300">
            Get Started
          </button>
          <button className="bg-white text-blue-800 font-bold py-2 px-4 ml-4  border border-blue-800 hover:bg-blue-800 hover:text-white transition duration-300">
            Register
          </button>
      </div>
    </div>
  );
}