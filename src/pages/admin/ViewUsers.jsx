export default function ViewUsers() {
  return (
    <div className="flex flex-col max-w-[800px] w-full font-sans">
      <header className="mb-2">
        <p className="m-0 text-sm text-[#9a9896] font-medium">Admin</p>
        <h1 className="mt-1 m-0 text-2xl sm:text-[28px] font-bold text-[#1a1917] font-serif tracking-tight leading-tight">
          View Users
        </h1>
      </header>
      <p className="text-[#6b6966]">
        User list and management will appear here.
      </p>
    </div>
  );
}
