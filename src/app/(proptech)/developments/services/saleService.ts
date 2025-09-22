import { Sale, Payment, Lot, Client } from '../components/types';
import { developmentService } from './developmentService';
import { clientService } from './clientService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const LOCAL_STORAGE_KEY = "sales";

const getStoredSales = (): Sale[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveSales = (sales: Sale[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sales));
};

// Función auxiliar para generar un ID único
const generateId = () => Math.random().toString(36).substr(2, 9);

// Función para generar cuotas automáticamente
const generatePayments = (sale: Sale): Payment[] => {
  const payments: Payment[] = [];
  const monthlyAmount = sale.monthlyPayment;
  const startDate = new Date(sale.startDate);
  
  for (let i = 0; i < sale.totalPayments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    payments.push({
      id: generateId(),
      saleId: sale.id,
      amount: monthlyAmount,
      dueDate: dueDate.toISOString(),
      status: i === 0 ? 'paid' : 'pending', // La primera cuota se marca como pagada (cuota inicial)
      method: 'cash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  return payments;
};

// Inicializar clientes de ejemplo si no existen
const clientExamples = [
  {
    id: "client-1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@email.com",
    phone: "+54 9 11 1234-5678",
    dni: "12345678",
    address: "Av. Corrientes 1234",
    city: "Buenos Aires",
    state: "Buenos Aires",
    zip: "1043",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "client-2",
    firstName: "María",
    lastName: "González",
    email: "maria.gonzalez@email.com",
    phone: "+54 9 11 9876-5432",
    dni: "87654321",
    address: "Calle Florida 567",
    city: "Buenos Aires",
    state: "Buenos Aires",
    zip: "1005",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

if (typeof window !== "undefined") {
  const storedClients = localStorage.getItem("clients");
  if (!storedClients || JSON.parse(storedClients).length === 0) {
    localStorage.setItem("clients", JSON.stringify(clientExamples));
  }
}

let sales: Sale[] = getStoredSales();
if (sales.length === 0) {
  sales = [
    {
      id: "sale-1",
      clientId: "client-1",
      totalPrice: 150000,
      downPayment: 30000,
      remainingAmount: 120000,
      monthlyPayment: 5000,
      totalPayments: 24,
      startDate: new Date().toISOString(),
      status: "completed",
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sale-2",
      clientId: "client-2",
      totalPrice: 200000,
      downPayment: 50000,
      remainingAmount: 150000,
      monthlyPayment: 6250,
      totalPayments: 24,
      startDate: new Date().toISOString(),
      status: "active",
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  saveSales(sales);
}

export const saleService = {
  async getAllSales(): Promise<Sale[]> {
    await delay(300);
    return [...sales];
  },

  async getSaleById(id: string): Promise<Sale | undefined> {
    await delay(300);
    return sales.find((s) => s.id === id);
  },

  async getSalesByLotId(lotId: string): Promise<Sale[]> {
    await delay(300);
    return sales.filter((s) => s.lotId === lotId);
  },

  async getSalesByClientId(clientId: string): Promise<Sale[]> {
    await delay(300);
    return sales.filter((s) => s.clientId === clientId);
  },

  async createSale(saleData: {
    lotId: string;
    clientId: string;
    totalPrice: number;
    downPayment: number;
    totalPayments: number;
    startDate: string;
  }): Promise<Sale> {
    await delay(300);
    
    const monthlyPayment = (saleData.totalPrice - saleData.downPayment) / saleData.totalPayments;
    const remainingAmount = saleData.totalPrice - saleData.downPayment;
    
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      lotId: saleData.lotId,
      clientId: saleData.clientId,
      totalPrice: saleData.totalPrice,
      downPayment: saleData.downPayment,
      remainingAmount,
      monthlyPayment,
      totalPayments: saleData.totalPayments,
      startDate: saleData.startDate,
      status: 'active',
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generar cuotas automáticamente
    newSale.payments = generatePayments(newSale);

    sales.push(newSale);
    saveSales(sales);

    // Actualizar el estado del lote
    await this.updateLotStatus(saleData.lotId, 'sold');

    return newSale;
  },

  async updateSale(id: string, updates: Partial<Sale>): Promise<Sale | undefined> {
    await delay(300);
    const index = sales.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    const updatedSale = {
      ...sales[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as Sale;
    sales[index] = updatedSale;
    saveSales(sales);
    return updatedSale;
  },

  async deleteSale(id: string): Promise<boolean> {
    await delay(300);
    const saleToDelete = sales.find(s => s.id === id);
    
    if (saleToDelete) {
      // Restaurar el estado del lote a disponible
      if (saleToDelete.lotId) {
        await this.updateLotStatus(saleToDelete.lotId, 'available');
      }
    }
    
    const initialLength = sales.length;
    const updatedSales = sales.filter((s) => s.id !== id);
    saveSales(updatedSales);
    return updatedSales.length !== initialLength;
  },

  async recordPayment(saleId: string, paymentData: {
    amount: number;
    paymentDate: string;
    method: string;
    reference?: string;
    notes?: string;
  }): Promise<Payment | undefined> {
    await delay(300);
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex === -1) return undefined;

    const sale = sales[saleIndex];
    const pendingPayment = sale.payments.find(p => p.status === 'pending');
    
    if (!pendingPayment) return undefined;

    // Actualizar el pago
    const updatedPayment: Payment = {
      ...pendingPayment,
      paymentDate: paymentData.paymentDate,
      status: 'paid',
      method: paymentData.method as any,
      reference: paymentData.reference,
      notes: paymentData.notes,
      updatedAt: new Date().toISOString(),
    };

    // Actualizar la lista de pagos
    const updatedPayments = sale.payments.map(p => 
      p.id === pendingPayment.id ? updatedPayment : p
    );

    // Verificar si la venta está completa
    const allPaid = updatedPayments.every(p => p.status === 'paid');
    const newStatus = allPaid ? 'completed' : 'active';

    // Actualizar la venta
    const updatedSale: Sale = {
      ...sale,
      payments: updatedPayments,
      status: newStatus,
      remainingAmount: Math.max(0, sale.remainingAmount - paymentData.amount),
      updatedAt: new Date().toISOString(),
    };

    sales[saleIndex] = updatedSale;
    saveSales(sales);

    return updatedPayment;
  },

  async getPaymentHistory(saleId: string): Promise<Payment[]> {
    await delay(300);
    const sale = sales.find(s => s.id === saleId);
    return sale?.payments || [];
  },

  async getSalesSummary(): Promise<{
    totalSales: number;
    totalRevenue: number;
    activeSales: number;
    completedSales: number;
    overduePayments: number;
  }> {
    await delay(300);
    
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const activeSales = sales.filter(s => s.status === 'active').length;
    const completedSales = sales.filter(s => s.status === 'completed').length;
    
    const today = new Date();
    const overduePayments = sales.reduce((count, sale) => {
      const overdue = sale.payments.filter(p => 
        p.status === 'pending' && new Date(p.dueDate) < today
      ).length;
      return count + overdue;
    }, 0);

    return {
      totalSales,
      totalRevenue,
      activeSales,
      completedSales,
      overduePayments,
    };
  },

  async updateLotStatus(lotId: string, status: 'available' | 'sold' | 'reserved'): Promise<void> {
    // Obtener todos los desarrollos
    const developments = await developmentService.getAllDevelopments();
    
    // Encontrar el desarrollo que contiene el lote
    for (const development of (developments as any).data || developments) {
      if (development.type === 'loteamiento') {
        const loteamiento = development as any;
        const lotIndex = loteamiento.lots?.findIndex((lot: any) => lot.id === lotId);
        
        if (lotIndex !== -1) {
          // Actualizar el estado del lote
          loteamiento.lots[lotIndex].status = status;
          
          // Actualizar el desarrollo
          await developmentService.updateDevelopment(development.id, loteamiento);
          break;
        }
      }
    }
  }
}; 