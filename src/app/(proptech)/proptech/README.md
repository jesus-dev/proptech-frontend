# Módulo PropTech - Frontend

Este módulo contiene toda la funcionalidad relacionada con la gestión administrativa de PropTech como producto.

## Estructura

```
proptech/
├── services/         # Servicios para comunicación con el backend
├── components/       # Componentes reutilizables del módulo
├── types/            # Definiciones de tipos TypeScript
├── hooks/            # Custom hooks
├── registrations/    # Página de gestión de registros públicos
└── appointments/      # Página de gestión de citas agendadas
```

## Servicios

### proptechService
Servicio principal para comunicación con el backend del módulo PropTech.

**Métodos**:
- `getPublicRegistrations(page, size)` - Obtener registros públicos paginados
- `getPublicAppointments(page, size)` - Obtener citas agendadas paginadas

## Tipos

Definiciones TypeScript compartidas:
- `PublicRegistration` - Tipo para registros públicos
- `PublicAppointment` - Tipo para citas agendadas
- `PaginatedResponse<T>` - Tipo genérico para respuestas paginadas
- `ParsedRegistrationNotes` - Tipo para notas parseadas de registros

## Páginas

### Registros Públicos (`/proptech/registrations`)
Página para gestionar y visualizar los registros realizados desde el formulario público.

### Citas Agendadas (`/proptech/appointments`)
Página para gestionar y visualizar las citas agendadas desde los registros públicos.

## Permisos

Todas las páginas y funcionalidades de este módulo requieren el rol `SUPER_ADMIN`.

## Uso

```typescript
import { proptechService } from '@/app/(proptech)/proptech/services/proptechService';
import { PublicRegistration } from '@/app/(proptech)/proptech/types';

// Obtener registros
const response = await proptechService.getPublicRegistrations(0, 50);
const registrations: PublicRegistration[] = response.content;
```

