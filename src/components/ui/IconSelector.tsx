"use client";
import React, { useState, useMemo } from 'react';
import {
  Wifi,
  GlassWater,
  ParkingSquare,
  Dumbbell,
  Home,
  Car,
  Bed,
  Bath,
  Ruler,
  Heart,
  MapPin,
  Users,
  Building,
  Leaf,
  Snowflake,
  Droplets,
  Shield,
  Tv,
  Utensils,
  PawPrint,
  Bike,
  Phone,
  Mail,
  Globe,
  Download,
  Eye,
  Clock,
  Award,
  Zap,
  Wrench,
  Bell,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Thermometer,
  Camera,
  Video,
  Music,
  Book,
  FileText,
  Folder,
  Printer,
  Monitor,
  Gamepad2,
  Palette,
  Brush,
  Scissors,
  Hammer,
  Cog,
  Gauge,
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Flag,
  Trophy,
  Medal,
  Gift,
  ShoppingCart,
  CreditCard,
  Wallet,
  PiggyBank,
  Calculator,
  Calendar,
  Timer,
  AlarmClock,
  Megaphone,
  Speaker,
  Volume2,
  Headphones,
  Radio,
  Smartphone,
  Tablet,
  Laptop,
  Keyboard,
  Mouse,
  HardDrive,
  Database,
  Server,
  Router,
  Bluetooth,
  Signal,
  Satellite,
  Navigation,
  Compass,
  Map,
  Anchor,
  Ship,
  Plane,
  Train,
  Bus,
  Truck,
  Tractor,
  Rocket
} from 'lucide-react';
import { Search, X, Grid3X3 } from 'lucide-react';

const ICONS = [
  { name: 'Wifi', component: Wifi },
  { name: 'GlassWater', component: GlassWater },
  { name: 'ParkingSquare', component: ParkingSquare },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Home', component: Home },
  { name: 'Car', component: Car },
  { name: 'Bed', component: Bed },
  { name: 'Bath', component: Bath },
  { name: 'Ruler', component: Ruler },
  { name: 'Heart', component: Heart },
  { name: 'MapPin', component: MapPin },
  { name: 'Users', component: Users },
  { name: 'Building', component: Building },
  { name: 'Leaf', component: Leaf },
  { name: 'Snowflake', component: Snowflake },
  { name: 'Droplets', component: Droplets },
  { name: 'Shield', component: Shield },
  { name: 'Tv', component: Tv },
  { name: 'Utensils', component: Utensils },
  { name: 'PawPrint', component: PawPrint },
  { name: 'Bike', component: Bike },
  { name: 'Phone', component: Phone },
  { name: 'Mail', component: Mail },
  { name: 'Globe', component: Globe },
  { name: 'Download', component: Download },
  { name: 'Eye', component: Eye },
  { name: 'Clock', component: Clock },
  { name: 'Award', component: Award },
  { name: 'Zap', component: Zap },
  { name: 'Wrench', component: Wrench },
  { name: 'Bell', component: Bell },
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Cloud', component: Cloud },
  { name: 'Umbrella', component: Umbrella },
  { name: 'Thermometer', component: Thermometer },
  { name: 'Camera', component: Camera },
  { name: 'Video', component: Video },
  { name: 'Music', component: Music },
  { name: 'Book', component: Book },
  { name: 'FileText', component: FileText },
  { name: 'Folder', component: Folder },
  { name: 'Printer', component: Printer },
  { name: 'Monitor', component: Monitor },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Palette', component: Palette },
  { name: 'Brush', component: Brush },
  { name: 'Scissors', component: Scissors },
  { name: 'Hammer', component: Hammer },
  { name: 'Cog', component: Cog },
  { name: 'Gauge', component: Gauge },
  { name: 'BarChart3', component: BarChart3 },
  { name: 'PieChart', component: PieChart },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Target', component: Target },
  { name: 'Flag', component: Flag },
  { name: 'Trophy', component: Trophy },
  { name: 'Medal', component: Medal },
  { name: 'Gift', component: Gift },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'CreditCard', component: CreditCard },
  { name: 'Wallet', component: Wallet },
  { name: 'PiggyBank', component: PiggyBank },
  { name: 'Calculator', component: Calculator },
  { name: 'Calendar', component: Calendar },
  { name: 'Timer', component: Timer },
  { name: 'AlarmClock', component: AlarmClock },
  { name: 'Megaphone', component: Megaphone },
  { name: 'Speaker', component: Speaker },
  { name: 'Volume2', component: Volume2 },
  { name: 'Headphones', component: Headphones },
  { name: 'Radio', component: Radio },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Tablet', component: Tablet },
  { name: 'Laptop', component: Laptop },
  { name: 'Keyboard', component: Keyboard },
  { name: 'Mouse', component: Mouse },
  { name: 'HardDrive', component: HardDrive },
  { name: 'Database', component: Database },
  { name: 'Server', component: Server },
  { name: 'Router', component: Router },
  { name: 'Bluetooth', component: Bluetooth },
  { name: 'Signal', component: Signal },
  { name: 'Satellite', component: Satellite },
  { name: 'Navigation', component: Navigation },
  { name: 'Compass', component: Compass },
  { name: 'Map', component: Map },
  { name: 'Anchor', component: Anchor },
  { name: 'Ship', component: Ship },
  { name: 'Plane', component: Plane },
  { name: 'Train', component: Train },
  { name: 'Bus', component: Bus },
  { name: 'Truck', component: Truck },
  { name: 'Tractor', component: Tractor },
  { name: 'Rocket', component: Rocket }
];

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function IconSelector({ selectedIcon, onIconSelect, onClose, isOpen }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) return ICONS;
    const lower = searchTerm.toLowerCase();
    return ICONS.filter(icon => icon.name.toLowerCase().includes(lower));
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Seleccionar Icono
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedIcon ? `Icono seleccionado: ${selectedIcon}` : 'Elige un icono para el amenity'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar iconos... (ej: wifi, piscina, parking, casa)"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Icons Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {filteredIcons.map(({ name, component: Icon }) => (
                  <button
                    key={name}
                    onClick={() => { onIconSelect(name); onClose(); }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      selectedIcon === name
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    title={name}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">
                        {name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No se encontraron iconos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Intenta con otros términos de búsqueda o borra el filtro para ver todos los iconos disponibles.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Ver Todos los Iconos
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>💡 <strong>Consejo:</strong> Puedes escribir el nombre del icono o usar el selector visual</p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 