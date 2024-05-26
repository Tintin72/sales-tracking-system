export interface CreatedSale {
  amount: number;
  commission: number;
  isCommissionPaid: boolean;
  agent: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  product: {
    _id: string;
    name: string;
    price: number;
  };
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserSalesByDateResponse {
  _id?: string | null;
  totalSales: number;
  totalCommission: number;
}
