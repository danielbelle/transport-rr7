import { Link } from "react-router";

export default function LogoComponent({
  className = "w-[300px] max-w-[80vw]",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <Link to="/" className="block transition-transform hover:scale-105">
        <div className="p-2 rounded-md bg-transparent dark:bg-white/80 dark:p-3">
          <div className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">TAPP</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
