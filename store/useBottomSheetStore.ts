import { Order } from '@/types/product';
import { create } from 'zustand';

interface BottomSheetState {
    isOrdersBottomSheetOpen: boolean;
    openOrdersBottomSheet: () => void;
    closeOrdersBottomSheet: () => void;

    selectedOrder: Order | null;
    isOrderDetailsOpen: boolean;
    openOrderDetails: (order: Order) => void;
    closeOrderDetails: () => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
    isOrdersBottomSheetOpen: false,
    openOrdersBottomSheet: () => set({ isOrdersBottomSheetOpen: true }),
    closeOrdersBottomSheet: () => set({ isOrdersBottomSheetOpen: false }),

    selectedOrder: null,
    isOrderDetailsOpen: false,
    openOrderDetails: (order) => {
        set({
            selectedOrder: order,
            isOrderDetailsOpen: true
            // Removed isOrdersBottomSheetOpen: false to allow overlapping
        });
    },
    closeOrderDetails: () => {
        set({ selectedOrder: null, isOrderDetailsOpen: false });
    },
}));
