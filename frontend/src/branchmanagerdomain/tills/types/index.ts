export type BranchType = {
    id: string;
    name: string;
    status: string;
    manager: string;
  createdAt: string; // Assuming createdAt is a date string
};

export type Branch = {
    id: string;
    name: string;
    location: string;
    status: string;
    manager: string;
    createdAt: string;
};

export type Till = {
  id: string;
  name: string;
  location: string;
  status: string;
  // manager: string;
  operator: string;
  createdAt: string;
};
