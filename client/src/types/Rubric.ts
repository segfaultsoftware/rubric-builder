import { type Weight } from './Weight'
import { type Profile } from './Profile'

export enum RubricVisibility {
  MembersOnly = 'members_only',
  Template = 'template',
  SystemTemplate = 'system_template'

}

export interface Rubric {
  id?: number | null
  name: string
  descriptor: string
  visibility: RubricVisibility
  authorId?: number | null
  weights: Weight[]
  members: Profile[]
  pairings?: number[][]
}
