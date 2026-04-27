import InstructorLoginClient from "./InstructorLoginClient";

export default function InstructorLoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-500 to-brand-600 items-center justify-center p-8">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Instructor Portal</h2>
          <p className="text-lg text-white/80">Manage your attendance and profile</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <InstructorLoginClient />
    </div>
  );
}
