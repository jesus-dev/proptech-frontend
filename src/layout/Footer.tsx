import Link from "next/link";
import Image from 'next/image';
import VersionInfo from '@/components/common/VersionInfo';

export default function FooterCRM() {
  return (
    <footer className="w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-md py-2">
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
        <Image
          src="/images/logo/proptech.png"
          alt="PropTech"
          width={236}
          height={236}
          className="object-contain opacity-70 w-24 sm:w-32"
        />
        <span className="text-sm text-gray-500 dark:text-gray-200 font-medium tracking-wide select-none">
          © {new Date().getFullYear()} OnTech · Sistema de Gestión de Bienes Raíces - PropTech
        </span>
        <VersionInfo className="ml-auto" />
      </div>
    </footer>
  );
} 