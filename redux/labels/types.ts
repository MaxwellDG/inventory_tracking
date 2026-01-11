export type Label = {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
};

export type LabelResponse = Label[];

export type CreateLabelRequest = {
  name: string;
};

export type UpdateLabelRequest = {
  id: number;
  name: string;
};

