import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import {
  createMenuCategoryInputSchema,
  getMenuItemsByCategoryInputSchema,
  getMenuItemDetailsInputSchema,
  createMenuItemInputSchema,
  updateMenuItemInputSchema,
  createReservationInputSchema,
  updateReservationStatusInputSchema,
  getReservationsByDateInputSchema
} from './schema';

// Import handlers
import { getMenuCategories } from './handlers/get_menu_categories';
import { createMenuCategory } from './handlers/create_menu_category';
import { getMenuItemsByCategory } from './handlers/get_menu_items_by_category';
import { getMenuItemDetails } from './handlers/get_menu_item_details';
import { createMenuItem } from './handlers/create_menu_item';
import { updateMenuItem } from './handlers/update_menu_item';
import { getChefsSpecials } from './handlers/get_chefs_specials';
import { createReservation } from './handlers/create_reservation';
import { updateReservationStatus } from './handlers/update_reservation_status';
import { getReservationsByDate } from './handlers/get_reservations_by_date';
import { getAvailableTimeSlots } from './handlers/get_available_time_slots';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Menu Category routes
  getMenuCategories: publicProcedure
    .query(() => getMenuCategories()),

  createMenuCategory: publicProcedure
    .input(createMenuCategoryInputSchema)
    .mutation(({ input }) => createMenuCategory(input)),

  // Menu Item routes
  getMenuItemsByCategory: publicProcedure
    .input(getMenuItemsByCategoryInputSchema)
    .query(({ input }) => getMenuItemsByCategory(input)),

  getMenuItemDetails: publicProcedure
    .input(getMenuItemDetailsInputSchema)
    .query(({ input }) => getMenuItemDetails(input)),

  createMenuItem: publicProcedure
    .input(createMenuItemInputSchema)
    .mutation(({ input }) => createMenuItem(input)),

  updateMenuItem: publicProcedure
    .input(updateMenuItemInputSchema)
    .mutation(({ input }) => updateMenuItem(input)),

  // Chef's Specials route
  getChefsSpecials: publicProcedure
    .query(() => getChefsSpecials()),

  // Reservation routes
  createReservation: publicProcedure
    .input(createReservationInputSchema)
    .mutation(({ input }) => createReservation(input)),

  updateReservationStatus: publicProcedure
    .input(updateReservationStatusInputSchema)
    .mutation(({ input }) => updateReservationStatus(input)),

  getReservationsByDate: publicProcedure
    .input(getReservationsByDateInputSchema)
    .query(({ input }) => getReservationsByDate(input)),

  getAvailableTimeSlots: publicProcedure
    .input(getReservationsByDateInputSchema)
    .query(({ input }) => getAvailableTimeSlots(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();