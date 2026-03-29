import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function requireUser(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .first();
    if (!user) throw new Error("User not found");
    return user;
}

async function getOptionalUser(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .first();
}

function makeSlug(title: string): string {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 36);
    const suffix = Math.random().toString(36).slice(2, 6);
    return base ? `${base}-${suffix}` : `design-${suffix}`;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create or update a design. Returns the design ID. */
export const saveDesign = mutation({
    args: {
        designId: v.optional(v.id("posterDesigns")),
        title: v.string(),
        state: v.any(),
        thumbnail: v.optional(v.string()),
        isPrivate: v.boolean(),
        folderId: v.optional(v.id("posterFolders")),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const now = Date.now();

        if (args.designId) {
            const existing = await ctx.db.get(args.designId);
            if (!existing || existing.userId !== user._id) throw new Error("Not authorized");
            await ctx.db.patch(args.designId, {
                title: args.title,
                state: args.state,
                thumbnail: args.thumbnail,
                isPrivate: args.isPrivate,
                folderId: args.folderId,
                updatedAt: now,
            });
            return args.designId;
        }

        return await ctx.db.insert("posterDesigns", {
            userId: user._id,
            title: args.title,
            state: args.state,
            thumbnail: args.thumbnail,
            isPrivate: args.isPrivate,
            folderId: args.folderId,
            likesCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Duplicate a design (creates a private copy in the same folder). */
export const duplicateDesign = mutation({
    args: { designId: v.id("posterDesigns") },
    handler: async (ctx, { designId }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design || design.userId !== user._id) throw new Error("Not authorized");

        const now = Date.now();
        const { _id, _creationTime, ...rest } = design as any;
        void _id; void _creationTime;

        return await ctx.db.insert("posterDesigns", {
            ...rest,
            userId: user._id,
            title: `Copy of ${design.title}`,
            isPrivate: true,
            slug: undefined,
            likesCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Move a design to a different folder (or to root if folderId is null). */
export const moveToFolder = mutation({
    args: {
        designId: v.id("posterDesigns"),
        folderId: v.optional(v.id("posterFolders")),
    },
    handler: async (ctx, { designId, folderId }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design || design.userId !== user._id) throw new Error("Not authorized");
        await ctx.db.patch(designId, { folderId, updatedAt: Date.now() });
    },
});

/** Delete a design and its associated likes. */
export const deleteDesign = mutation({
    args: { designId: v.id("posterDesigns") },
    handler: async (ctx, { designId }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design || design.userId !== user._id) throw new Error("Not authorized");

        const likes = await ctx.db
            .query("posterLikes")
            .withIndex("by_designId", (q) => q.eq("designId", designId))
            .collect();
        for (const like of likes) await ctx.db.delete(like._id);

        await ctx.db.delete(designId);
    },
});

/** Toggle privacy. */
export const updateDesignPrivacy = mutation({
    args: { designId: v.id("posterDesigns"), isPrivate: v.boolean() },
    handler: async (ctx, { designId, isPrivate }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design || design.userId !== user._id) throw new Error("Not authorized");
        await ctx.db.patch(designId, { isPrivate, updatedAt: Date.now() });
    },
});

/** Rename a design title. */
export const renameDesign = mutation({
    args: { designId: v.id("posterDesigns"), title: v.string() },
    handler: async (ctx, { designId, title }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design || design.userId !== user._id) throw new Error("Not authorized");
        await ctx.db.patch(designId, { title, updatedAt: Date.now() });
    },
});

/** Generate or return existing slug. Makes design public automatically. */
export const generateSlug = mutation({
    args: { designId: v.id("posterDesigns") },
    handler: async (ctx, { designId }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design || design.userId !== user._id) throw new Error("Not authorized");

        if (design.slug) {
            if (design.isPrivate) {
                await ctx.db.patch(designId, { isPrivate: false, updatedAt: Date.now() });
            }
            return design.slug;
        }

        // Generate unique slug
        let slug: string;
        let attempts = 0;
        do {
            slug = makeSlug(design.title);
            const existing = await ctx.db
                .query("posterDesigns")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .first();
            if (!existing) break;
            attempts++;
        } while (attempts < 5);

        await ctx.db.patch(designId, {
            slug,
            isPrivate: false,
            updatedAt: Date.now(),
        });
        return slug;
    },
});

/** Set a custom slug. Returns error string if taken, or null on success. */
export const setCustomSlug = mutation({
    args: { designId: v.id("posterDesigns"), slug: v.string() },
    handler: async (ctx, { designId, slug }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design || design.userId !== user._id) throw new Error("Not authorized");

        const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
        if (!clean || clean.length < 3) throw new Error("Slug must be at least 3 characters");

        const existing = await ctx.db
            .query("posterDesigns")
            .withIndex("by_slug", (q) => q.eq("slug", clean))
            .first();
        if (existing && existing._id !== designId) throw new Error("This URL is already taken");

        await ctx.db.patch(designId, { slug: clean, updatedAt: Date.now() });
        return clean;
    },
});

/** Like/unlike. Returns true if liked, false if unliked. */
export const toggleLike = mutation({
    args: { designId: v.id("posterDesigns") },
    handler: async (ctx, { designId }) => {
        const user = await requireUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design) throw new Error("Design not found");
        if (design.isPrivate && design.userId !== user._id) throw new Error("Not authorized");

        const existing = await ctx.db
            .query("posterLikes")
            .withIndex("by_userId_designId", (q) =>
                q.eq("userId", user._id).eq("designId", designId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            await ctx.db.patch(designId, { likesCount: Math.max(0, design.likesCount - 1) });
            return false;
        } else {
            await ctx.db.insert("posterLikes", { designId, userId: user._id, createdAt: Date.now() });
            await ctx.db.patch(designId, { likesCount: design.likesCount + 1 });
            return true;
        }
    },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Get a single design by ID (owner only). */
export const getDesignById = query({
    args: { designId: v.id("posterDesigns") },
    handler: async (ctx, { designId }) => {
        const user = await getOptionalUser(ctx);
        const design = await ctx.db.get(designId);
        if (!design) return null;
        if (design.isPrivate && (!user || user._id !== design.userId)) return null;
        return design;
    },
});

/** All designs for the current user, newest first. Optionally filtered by folder. */
export const getMyDesigns = query({
    args: { folderId: v.optional(v.union(v.id("posterFolders"), v.null())) },
    handler: async (ctx, { folderId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return [];

        // If folderId is explicitly passed (even null = root), filter by it
        if (folderId !== undefined) {
            return await ctx.db
                .query("posterDesigns")
                .withIndex("by_userId_folderId", (q) =>
                    q.eq("userId", user._id).eq("folderId", folderId ?? undefined)
                )
                .order("desc")
                .collect();
        }

        // Otherwise return all designs
        return await ctx.db
            .query("posterDesigns")
            .withIndex("by_userId_updatedAt", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

/** Fetch a design by its slug (for public share page). */
export const getDesignBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        const design = await ctx.db
            .query("posterDesigns")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();
        if (!design || design.isPrivate) return null;

        const author = await ctx.db.get(design.userId);
        return { ...design, authorName: author?.name ?? "Unknown" };
    },
});

/** Recent public designs from other users (team gallery). */
export const getPublicDesigns = query({
    args: {},
    handler: async (ctx) => {
        const user = await getOptionalUser(ctx);
        if (!user) return [];

        const all = await ctx.db
            .query("posterDesigns")
            .withIndex("by_isPrivate", (q) => q.eq("isPrivate", false))
            .order("desc")
            .take(60);

        const others = all.filter((d) => d.userId !== user._id);

        return await Promise.all(
            others.map(async (d) => {
                const author = await ctx.db.get(d.userId);
                return { ...d, authorName: author?.name ?? "Unknown" };
            })
        );
    },
});

/** Design IDs that the current user has liked. */
export const getMyLikedDesignIds = query({
    args: {},
    handler: async (ctx) => {
        const user = await getOptionalUser(ctx);
        if (!user) return [] as string[];
        const likes = await ctx.db
            .query("posterLikes")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
        return likes.map((l) => l.designId as string);
    },
});

/** Check if a custom slug is available. */
export const checkSlugAvailable = query({
    args: { slug: v.string(), designId: v.optional(v.id("posterDesigns")) },
    handler: async (ctx, { slug, designId }) => {
        const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
        if (clean.length < 3) return false;
        const existing = await ctx.db
            .query("posterDesigns")
            .withIndex("by_slug", (q) => q.eq("slug", clean))
            .first();
        if (!existing) return true;
        return designId ? existing._id === designId : false;
    },
});
