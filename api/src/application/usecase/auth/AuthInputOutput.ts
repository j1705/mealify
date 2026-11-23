export type CredentialsInput = {
  email?: unknown;
  password?: unknown;
};

export type CurrentUserOutput = {
  userId: number;
  email: string;
};

export type SessionOutput = CurrentUserOutput & {
  sessionToken: string;
};
