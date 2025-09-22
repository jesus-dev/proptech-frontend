import React from 'react';


const HomeStats: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const experienceYears = currentYear - 2020;

  const stats = [
    {
      number: `${experienceYears}+`,
      label: "Años de Experiencia",
      icon: ClockIcon,
    },
    {
      number: "150+",
      label: "Propiedades",
      icon: HomeIcon,
    },
    {
      number: "75+",
      label: "En Alquiler",
      icon: HomeIcon,
    },
    {
      number: "150+",
      label: "Clientes Felices",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="text-center group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <stat.icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-2">
            {stat.number}
          </div>
          <div className="text-brand-100 text-sm md:text-base">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeStats; 