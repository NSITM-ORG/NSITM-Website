import { Link } from "react-router-dom";
import Logo from '../../assets/logo.png'


export default function SiteLogo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src={Logo}
        alt="Nextserve"
        className="w-18 h-18 md:w-24 md:h-28 rounded-md object-contain"
      />
      <div className="bg-primary py-7.5 px-[0.3px] z-5 -ml-2.5 mt-1.5"></div>
      <span className=" w-36 md:w-40 flex flex-col leading-tight font-heading uppercase">
        <span className="font-heading text-lg md:text-2xl font-bold text-primary">
          Nextserve
        </span>
        <span className="text-[9px] md:text-[10px] text-secondary font-medium uppercase tracking-wide text-text-secondary ">
          School Of Information Technology And Management
        </span>
      </span>
    </Link>
  );
}
