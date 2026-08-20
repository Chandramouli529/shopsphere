import authApiClient from "@/services/authApi";

/** Real request body shape for POST /orders/create — matches the given
 * backend field list exactly. Note deliveryAddress/city/state/
 * postalCode/country are separate top-level fields, not one nested
 * address object. */
export interface CreateOrderInput {
  items: Array<{ productId: string; title: string; price: number; quantity: number }>;
  paymentMethod: string;
  deliveryAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const orderApi = {
  create: async (data: CreateOrderInput) => {
    const response = await authApiClient.post("/orders/create", data);
    return response.data;
  },

  list: async () => {
    const response = await authApiClient.get("/orders");
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await authApiClient.get(`/orders/${id}`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await authApiClient.patch(`/orders/${id}/cancel`, {});
    return response.data;
  },
};