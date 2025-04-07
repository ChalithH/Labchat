import play from '../layout';
import frank from '../../../public/frank.svg';

export default function Header() {
  return (
    <div className="flex items-center justify-center h-16">
          <img src={frank.src} alt="Frank" className="w-8 h-8 mr-2" />
      <h1 className="text-black text-lg font-bold">Labchat</h1>
    </div>
  );
}
