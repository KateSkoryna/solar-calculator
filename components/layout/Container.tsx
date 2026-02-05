interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`container mx-auto w-full max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px] px-6 md:px-8 lg:px-12 xl:px-16 ${className}`}
    >
      {children}
    </div>
  );
}
