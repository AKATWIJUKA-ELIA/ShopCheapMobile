import { Order } from '@/types/product';
import { create } from 'zustand';

interface BottomSheetState {
    isOrdersBottomSheetOpen: boolean;
    ordersOpenTrigger: number;
    openOrdersBottomSheet: () => void;
    closeOrdersBottomSheet: () => void;

    selectedOrder: Order | null;
    isOrderDetailsOpen: boolean;
    orderDetailsTrigger: number;
    openOrderDetails: (order: Order) => void;
    closeOrderDetails: () => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
    isOrdersBottomSheetOpen: false,
    ordersOpenTrigger: 0,
    openOrdersBottomSheet: () => set((state) => ({ 
        isOrdersBottomSheetOpen: true, 
        ordersOpenTrigger: state.ordersOpenTrigger + 1 
    })),
    closeOrdersBottomSheet: () => set({ isOrdersBottomSheetOpen: false }),

    selectedOrder: null,
    isOrderDetailsOpen: false,
    orderDetailsTrigger: 0,
    openOrderDetails: (order) => {
        set((state) => ({
            selectedOrder: order,
            isOrderDetailsOpen: true,
            orderDetailsTrigger: state.orderDetailsTrigger + 1
        }));
    },
    closeOrderDetails: () => {
        set({ selectedOrder: null, isOrderDetailsOpen: false });
    },
}));
