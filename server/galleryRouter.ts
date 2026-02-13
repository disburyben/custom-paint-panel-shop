import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const galleryRouter = router({
  /**
   * List all active gallery items
   */
  list: publicProcedure.query(async () => {
    const items = await db.getAllGalleryItems();
    return items.filter(item => item.isActive === 1);
  }),
});
