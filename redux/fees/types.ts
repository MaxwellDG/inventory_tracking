export type Fee = {
  id: number;
  name: string;
  amount: number;
  type: string;
};

export type FeeResponse = Fee[];

export type CreateFeeRequest = Omit<Fee, "id">;

export type UpdateFeeRequest = Fee;

