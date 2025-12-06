export type Fee = {
  id: number;
  name: string;
  value: number;
  applies_to: "order"
};

export type FeeResponse = Fee[];

export type CreateFeeRequest = Omit<Fee, "id">;

export type UpdateFeeRequest = Fee;

