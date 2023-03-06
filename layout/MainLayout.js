export default function MainLayout({ children }) {
  return (
    <div className="mx-auto h-screen flex items-center">
      <main>
        <div className="py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
