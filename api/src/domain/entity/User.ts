import Email from "../vo/Email";

export type UserProps = {
  id?: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type CreateUserProps = Pick<UserProps, "email" | "passwordHash">;

export default class User {
  private id: number | undefined;
  private email: Email;
  private passwordHash: string;
  private createdAt: Date;

  constructor({ id, email, passwordHash, createdAt }: UserProps) {
    this.id = id;
    this.email = new Email(email);
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }

  static create(props: CreateUserProps, createdAt: Date) {
    return new User({ ...props, createdAt });
  }

  getId() {
    return this.id;
  }

  getEmail() {
    return this.email.getValue();
  }

  getPasswordHash() {
    return this.passwordHash;
  }

  getCreatedAt() {
    return this.createdAt;
  }
}
