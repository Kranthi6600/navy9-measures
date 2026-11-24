export type ActionState = { error?: string; success?: string } | undefined;

export type SearchResult = {
  customers: { id: string; name: string; mobile: string }[];
  orders: { id: string; orderNumber: string; customerName: string }[];
};
