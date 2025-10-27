export default function LogoComponent({
  className = "w-[300px] max-w-[80vw]",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <a
        href="https://www.viadutos.rs.gov.br/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-105"
      >
        <div className="p-2 rounded-md bg-transparent dark:bg-white/80 dark:p-3">
          <div className="w-full h-12 flex items-center justify-center">
            <img
              src="/logo-prefeitura.png"
              alt="Logo da Prefeitura - Site Oficial"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </a>
    </div>
  );
}
