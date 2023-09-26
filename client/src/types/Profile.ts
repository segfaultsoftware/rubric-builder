export interface Profile {
  id: number
  displayName: string
  isAdmin: boolean
}

export interface ProfileAuthentication {
  email: string
  password: string
  passwordConfirmation?: string
}
