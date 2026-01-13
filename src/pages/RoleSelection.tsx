import { useNavigate } from "react-router-dom";
import { ChefHat, UtensilsCrossed, LayoutDashboard } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'waiter',
      title: 'Waiter Interface',
      description: 'Table management & ordering',
      icon: UtensilsCrossed,
      path: '/waiter',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'kitchen',
      title: 'Kitchen Display',
      description: 'Order preparation view',
      icon: ChefHat,
      path: '/login/kitchen',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      id: 'admin',
      title: 'Administration',
      description: 'System control panel',
      icon: LayoutDashboard,
      path: '/login/admin',
      color: 'bg-stone-100 text-stone-700',
    },
  ];

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-y-auto">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50 to-transparent opacity-50 -z-10" />

      <div className="w-full max-w-4xl flex flex-col items-center z-10 py-8 md:py-0">

        {/* Brand Section */}
        <div className="text-center mb-8 md:mb-12 animate-in fade-in zoom-in duration-700">
          <div className="relative inline-block group cursor-pointer">
            <div className="absolute inset-0 bg-amber-200 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
            <img
              src="/logos/logo2brown.jpeg"
              alt="Ama Bakery Logo"
              className="relative h-24 w-24 md:h-28 md:w-28 rounded-[2rem] mb-6 object-cover border-4 border-white transform transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-800 tracking-tight mb-3">
            Ama Bakery
          </h1>
          <p className="text-base md:text-lg text-stone-500 font-medium tracking-wide">
            Select your workspace
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full animate-in slide-in-from-bottom-8 duration-700 delay-150">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="group relative flex flex-col items-center p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-amber-900/5 border-4 border-stone-100/80 hover:border-amber-200/50 transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full ${role.color} flex items-center justify-center mb-4 md:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <role.icon className="h-8 w-8 md:h-9 md:w-9" strokeWidth={1.5} />
              </div>

              <h3 className="text-lg md:text-xl font-bold text-stone-800 mb-2 group-hover:text-amber-900 transition-colors">
                {role.title}
              </h3>

              <p className="text-stone-400 text-sm font-medium text-center leading-relaxed">
                {role.description}
              </p>

              {/* Hover Indicator */}
              <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-amber-600 hidden md:block">
                <span className="text-2xl">→</span>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-12 md:absolute md:bottom-6 text-center w-full text-stone-300 text-[10px] md:text-xs tracking-widest font-medium uppercase">
        Designed for Ama Bakery
      </footer>
    </div>
  );
}
