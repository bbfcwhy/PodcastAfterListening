import { addToLibrary, removeFromLibrary } from "@/lib/library/actions";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
jest.mock("@/lib/supabase/server", () => ({
    createClient: jest.fn(),
}));

// Mock next/cache
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

describe("Library Actions", () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            auth: {
                getUser: jest.fn(),
            },
            from: jest.fn().mockReturnThis(),
            insert: jest.fn(),
            delete: jest.fn().mockReturnThis(),
            match: jest.fn(),
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should add item to library", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
        mockSupabase.insert.mockResolvedValue({ error: null });

        await addToLibrary("show1");

        expect(mockSupabase.from).toHaveBeenCalledWith("library_items");
        expect(mockSupabase.insert).toHaveBeenCalledWith({ user_id: "user1", show_id: "show1" });
    });

    it("should ignore duplicate insertion", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
        mockSupabase.insert.mockResolvedValue({ error: { code: "23505" } }); // Duplicate error code

        await expect(addToLibrary("show1")).resolves.not.toThrow();
    });

    it("should remove item from library", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
        mockSupabase.match.mockResolvedValue({ error: null });

        await removeFromLibrary("show1");

        expect(mockSupabase.from).toHaveBeenCalledWith("library_items");
        expect(mockSupabase.delete).toHaveBeenCalled();
        expect(mockSupabase.match).toHaveBeenCalledWith({ user_id: "user1", show_id: "show1" });
    });

    it("should throw error if unauthorized", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: "Unauthorized" });

        await expect(addToLibrary("show1")).rejects.toThrow("Unauthorized");
    });
});
