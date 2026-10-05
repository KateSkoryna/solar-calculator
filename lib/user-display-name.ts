interface NamedUser {
  name: string | null;
  email: string;
}

export function userDisplayName({ name, email }: NamedUser) {
  return name?.trim() || email;
}
