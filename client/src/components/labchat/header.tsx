import Image from "next/image";

import frank from '../../../public/frank.svg';
import squaremenu from '../../../public/square-menu.svg';


export default function Header() {
  return (
    <header className="flex items-center justify-between shadow-md border-b border-gray-300 bg-[#F5F7FA] py-4">
      <Image
        className="ml-10"
        src={ frank.src  }
        alt="Frank the Flask"
        width={ 64 }
        height={ 64 }
        priority />

      <h1 className="text-[#284AA3] text-4xl font-bold mr-12 play-font absolute left-1/2 transform -translate-x-1/2">Labchat</h1>

      <Image
        className="mr-4"
        src={ squaremenu.src  }
        alt="Burger Menu Icon"
        width={ 48 }
        height={ 48 } />
    </header>
  );
}
