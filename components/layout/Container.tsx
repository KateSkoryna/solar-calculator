export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto w-full max-w-[1200px] px-6 md:px-8 lg:px-12 xl:px-16">
      {children}
    </div>
  );
}
