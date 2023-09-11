import { type Profile, selectProfileByProfileId } from './profileSlice'

describe('profileSlice', () => {
  describe('selectors', () => {
    describe('selectProfileByProfileId', () => {
      it('maps id to profile for all profiles', () => {
        expect(selectProfileByProfileId.resultFunc([])).toEqual(new Map())

        const user1: Profile = { id: 1, displayName: 'Foo' }
        const user2: Profile = { id: 2, displayName: 'Bar' }
        const user3: Profile = { id: 3, displayName: 'Baz' }

        const expected = new Map<number, Profile>()
        expected.set(user1.id, user1)
        expected.set(user2.id, user2)
        expected.set(user3.id, user3)

        expect(selectProfileByProfileId.resultFunc([user1, user2, user3])).toEqual(expected)
      })
    })
  })
})
