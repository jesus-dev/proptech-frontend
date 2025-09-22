export interface TeamMember {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  image: string;
  description?: string;
  specialties?: string[];
  experience?: string;
  socialMedia?: {
    linkedin?: string;
    whatsapp?: string;
    instagram?: string;
  };
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "maria-gonzalez",
    name: "Yoana Bentos",
    position: "CEO / Agente Principal",
    phone: "+595981 001 411",
    email: "yoana.bentos@onbienesraices.com.py",
    image: "/images/user/yoana.avif",
    description: "Más de 6 años de experiencia en el sector inmobiliario",
    specialties: ["Ventas", "Asesoramiento", "Negociación"],
    experience: "6+ años",
    socialMedia: {
      whatsapp: "+595981001411",
      linkedin: "maria-gonzalez-on"
    }
  },
  {
    id: "carlos-rodriguez",
    name: "Estrella Toledo",
    position: "Especialista en Ventas",
    phone: "+595981 001 412",
    email: "estrella.toledo@onbienesraices.com.py",
    image: "/images/user/estrella.avif",
    description: "Especialista en desarrollo de negocios inmobiliarios",
    specialties: ["Ventas Premium", "Desarrollo", "Marketing"],
    experience: "15+ años",
    socialMedia: {
      whatsapp: "+595981001412",
      linkedin: "carlos-rodriguez-on"
    }
  },
  {
    id: "ana-martinez",
    name: "Gloria Bentos",
    position: "Asesora de Alquileres",
    phone: "+595981 001 413",
    email: "ana@onbienesraices.com.py",
    image: "/images/user/gloria.avif",
    description: "Experta en estrategias digitales para el sector inmobiliario",
    specialties: ["Alquileres", "Digital", "Clientes"],
    experience: "12+ años",
    socialMedia: {
      whatsapp: "+595981001413",
      linkedin: "ana-martinez-on"
    }
  }
];

// Función para obtener miembros del equipo por especialidad
export const getTeamMembersBySpecialty = (specialty: string): TeamMember[] => {
  return TEAM_MEMBERS.filter(member => 
    member.specialties?.includes(specialty)
  );
};

// Función para obtener un miembro específico por ID
export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return TEAM_MEMBERS.find(member => member.id === id);
};

// Función para obtener miembros principales (primeros 3)
export const getMainTeamMembers = (): TeamMember[] => {
  return TEAM_MEMBERS.slice(0, 3);
};

// Función para obtener todos los miembros
export const getAllTeamMembers = (): TeamMember[] => {
  return TEAM_MEMBERS;
}; 