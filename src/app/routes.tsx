import { createBrowserRouter } from 'react-router';
import { Tables } from './pages/Tables';
import { Order } from './pages/Order';
import { Menu } from './pages/Menu';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { OrderHistory } from './pages/OrderHistory';
import { OrderDetails } from './pages/OrderDetails';
import { StaffManagement } from './pages/StaffManagement';
import { TableReservations } from './pages/TableReservations';
import { SuperAdminPanel } from './pages/SuperAdminPanel';
import { RoleSelect } from './pages/RoleSelect';
import { SalesReports } from './pages/SalesReports';
import { Subscription } from './pages/Subscription';
import { SubscriptionPayment } from './pages/SubscriptionPayment';
import { SubscriptionSuccess } from './pages/SubscriptionSuccess';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Tables,
  },
  {
    path: '/order/:tableNumber',
    Component: Order,
  },
  {
    path: '/menu',
    Component: Menu,
  },
  {
    path: '/role-select',
    Component: RoleSelect,
  },
  {
    path: '/owner/dashboard',
    Component: OwnerDashboard,
  },
  {
    path: '/owner/history',
    Component: OrderHistory,
  },
  {
    path: '/owner/order/:orderId',
    Component: OrderDetails,
  },
  {
    path: '/owner/staff',
    Component: StaffManagement,
  },
  {
    path: '/owner/reservations',
    Component: TableReservations,
  },
  {
    path: '/owner/reports',
    Component: SalesReports,
  },
  {
    path: '/owner/subscription',
    Component: Subscription,
  },
  {
    path: '/owner/subscription/payment',
    Component: SubscriptionPayment,
  },
  {
    path: '/owner/subscription/success',
    Component: SubscriptionSuccess,
  },
  {
    path: '/admin',
    Component: SuperAdminPanel,
  },
]);
