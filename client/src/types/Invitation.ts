export interface Invitation {
  id: number
  invitationToken: string
  email: string
  password?: string
  passwordConfirmation?: string
}
