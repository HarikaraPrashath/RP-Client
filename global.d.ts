declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module 'next/navigation';
declare module 'framer-motion';
declare module 'lucide-react';
declare module 'next/image';
declare module 'next/link';
declare module 'clsx' {
  type ClassValue = any;
  const clsx: (...inputs: any[]) => string;
  export default clsx;
  export { ClassValue };
}
