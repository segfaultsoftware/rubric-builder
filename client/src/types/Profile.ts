export interface Profile {
  id: number
  displayName: string
}

export interface ProfileAuthentication {
  email: string
  password: string
  passwordConfirmation?: string
}
