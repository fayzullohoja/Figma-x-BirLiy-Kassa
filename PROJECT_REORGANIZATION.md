# BirLiy Kassa - Project Reorganization Progress

## Goal
Reorganize the Vite + React Router project into a cleaner architecture for better maintainability and scalability.

## ✅ Completed Steps

### 1. Created New Type Structure ✅
- `/src/types/table.ts` - Table and Reservation types
- `/src/types/menu.ts` - Dish types
- `/src/types/order.ts` - Order, OrderItem, DashboardStats types
- `/src/types/user.ts` - User, Waiter, Restaurant types
- `/src/types/index.ts` - Central export point

### 2. Created Lib/Utils Structure ✅
- `/src/lib/utils/format.ts` - Currency and date formatting utilities
- `/src/lib/utils/index.ts` - Utilities export

### 3. Created Components/Layout Structure ✅
- `/src/components/layout/Header.tsx` - Moved from `/src/app/components/`
- `/src/components/layout/Navigation.tsx` - Moved from `/src/app/components/`
- `/src/components/layout/SubscriptionGuard.tsx` - Moved from `/src/app/components/`
- `/src/components/layout/index.ts` - Layout components export

### 4. Created Feature Modules ✅
- `/src/features/subscription/data/mockData.ts` - Subscription-related data
- `/src/lib/data/mockData.ts` - Centralized mock data with re-exports

### 5. Updated All Pages ✅
Updated import paths in all page files:
- ✅ `/src/app/pages/SalesReports.tsx`
- ✅ `/src/app/pages/Tables.tsx`
- ✅ `/src/app/pages/Order.tsx`
- ✅ `/src/app/pages/Menu.tsx`
- ✅ `/src/app/pages/OwnerDashboard.tsx`
- ✅ `/src/app/pages/OrderHistory.tsx`
- ✅ `/src/app/pages/OrderDetails.tsx`
- ✅ `/src/app/pages/StaffManagement.tsx`
- ✅ `/src/app/pages/TableReservations.tsx`
- ✅ `/src/app/pages/Subscription.tsx`
- ✅ `/src/app/pages/SubscriptionPayment.tsx`
- ✅ `/src/app/pages/SubscriptionSuccess.tsx`
- ✅ `/src/app/pages/SuperAdminPanel.tsx`
- ✅ `/src/app/pages/RoleSelect.tsx`

All imports now use new paths:
- `../../components/layout/` for Header, Navigation, SubscriptionGuard
- `../../lib/utils/format` for formatting utilities
- `../../lib/data/mockData` for mock data
- `../../types` for TypeScript types

## 📋 Next Steps (Remaining Work)

### Step 6: Create Feature Modules
Organize pages into feature folders:

```
/src/features/
  tables/
    pages/TablesPage.tsx (from Tables.tsx)
    components/TableCard.tsx
  orders/
    pages/OrderPage.tsx (from Order.tsx)
    pages/OrderDetailsPage.tsx (from OrderDetails.tsx)
  menu/
    pages/MenuPage.tsx (from Menu.tsx)
  owner/
    pages/DashboardPage.tsx (from OwnerDashboard.tsx)
    pages/OrderHistoryPage.tsx (from OrderHistory.tsx)
  staff/
    pages/StaffManagementPage.tsx (from StaffManagement.tsx)
  reservations/
    pages/TableReservationsPage.tsx (from TableReservations.tsx)
  subscription/
    pages/SubscriptionPage.tsx (from Subscription.tsx)
    pages/SubscriptionPaymentPage.tsx (from SubscriptionPayment.tsx)
    pages/SubscriptionSuccessPage.tsx (from SubscriptionSuccess.tsx)
    data/mockData.ts (already created)
  admin/
    pages/SuperAdminPanelPage.tsx (from SuperAdminPanel.tsx)
  auth/
    pages/RoleSelectPage.tsx (from RoleSelect.tsx)
```

### Step 7: Move UI Components
- Keep `/src/components/ui/` as is (shadcn components)
- Move `/src/app/components/figma/` to `/src/components/figma/`
- Move `/src/app/components/TableCard.tsx` to feature module

### Step 8: Update Routes
- Update `/src/app/routes.ts` to import from new feature locations

### Step 9: Cleanup
- Remove old `/src/app/components/` folder (except ui)
- Remove old `/src/app/pages/` folder
- Remove old `/src/app/data/` folder
- Remove old `/src/app/utils/` folder
- Remove old `/src/app/types.ts` file

## Current Project Structure

```
/src/
  app/
    App.tsx
    routes.ts
    components/ (old - to be removed)
    pages/ (old - to be removed)
    data/ (old - to be removed)
    utils/ (old - to be removed)
    types.ts (old - to be removed)
  
  components/ ✅ NEW
    layout/ ✅
      Header.tsx
      Navigation.tsx
      SubscriptionGuard.tsx
      index.ts
    ui/ (existing shadcn components)
    figma/ (to be moved here)
  
  features/ ✅ NEW
    subscription/ ✅
      data/
        mockData.ts
  
  lib/ ✅ NEW
    utils/ ✅
      format.ts
      index.ts
    data/ ✅
      mockData.ts
  
  types/ ✅ NEW
    table.ts
    menu.ts
    order.ts
    user.ts
    index.ts
```

## Target Project Structure

```
/src/
  app/
    App.tsx (minimal entry point)
    routes.ts (imports from features)
  
  features/
    tables/
    orders/
    menu/
    owner/
    staff/
    reservations/
    subscription/
    admin/
    auth/
  
  components/
    layout/
    ui/
    figma/
  
  lib/
    utils/
    data/
    supabase/ (future)
    telegram/ (future)
  
  types/
    *.ts
```

## Migration Strategy

1. ✅ Create new folder structure
2. ✅ Move types to `/src/types/`
3. ✅ Move utilities to `/src/lib/utils/`
4. ✅ Move layout components to `/src/components/layout/`
5. ✅ Update imports in all pages
6. ⏳ Create feature modules
7. ⏳ Move pages to feature folders
8. ⏳ Update routes
9. ⏳ Cleanup old structure

## Notes

- Using Vite + React Router (NOT Next.js)
- Backward compatibility maintained during migration
- No breaking changes - app continues to work
- Gradual migration approach