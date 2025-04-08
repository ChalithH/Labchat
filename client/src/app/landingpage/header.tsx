import frank from '../../../public/frank.svg';
import squaremenu from '../../../public/square-menu.svg';

export default function Header() {
  return (
    <div className="flex items-center justify-between h-32 border-b border-gray-300 bg-white shadow-md ">
      <img src={frank.src} alt="Frank" className="w-16 h-16 ml-10" />
      <h1 className="text-blue-800 text-4xl font-bold mr-12 play-font">Labchat</h1>
      <img src={squaremenu.src} alt="burger menu" className="w-12 h-12 mr-4" />
    </div>
  );
}
