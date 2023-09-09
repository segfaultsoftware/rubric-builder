import React from 'react'
import { renderWithProviders } from '../../utils/test-utils'
import RubricForm from './RubricForm'
import { type Rubric, type Weight } from './rubricSlice'
import { type Profile } from '../profile/profileSlice'
import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('RubricForm', () => {
  const author: Profile = {
    id: 100,
    displayName: 'Supervisor'
  }
  let rubric: Rubric

  const onRubricChange = jest.fn()
  const onSubmit = jest.fn()

  const render = () => {
    return {
      user: userEvent.setup(),
      ...renderWithProviders(
        <RubricForm rubric={rubric} author={author} onRubricChange={onRubricChange} onSubmit={onSubmit} />
      )
    }
  }

  beforeEach(() => {
    rubric = {
      name: 'Some Rubric',
      weights: [{
        id: 1,
        name: 'Weight 1',
        description: 'Some Weight Description',
        profileWeights: []
      }],
      members: []
    }
  })

  it('renders the existing rubric name and weight info', async () => {
    const { findByDisplayValue } = render()
    expect(await findByDisplayValue('Some Rubric')).toBeInTheDocument()
    expect(await findByDisplayValue('Weight 1')).toBeInTheDocument()
    expect(await findByDisplayValue('Some Weight Description')).toBeInTheDocument()
  })

  it('handles rubric name change', async () => {
    const { user, findAllByLabelText } = render()

    const nameInputs = await findAllByLabelText('Name')
    const rubricNameInput = nameInputs[0]

    await user.type(rubricNameInput, '!')

    expect(onRubricChange).toHaveBeenCalledWith({
      ...rubric,
      name: 'Some Rubric!'
    })
  })

  it('handles adding a new blank weight', async () => {
    const { findByText } = render()

    const addButton = await findByText('Add')

    fireEvent.click(addButton)

    expect(onRubricChange).toHaveBeenCalledTimes(1)
    const upboundRubric = onRubricChange.mock.lastCall[0]
    expect(upboundRubric.name).toEqual(rubric.name)
    expect(upboundRubric.weights.length).toEqual(2)
    expect(upboundRubric.weights[0]).toEqual(rubric.weights[0])
    const newWeight = upboundRubric.weights[1]
    expect(newWeight.id).toBeGreaterThan(0)
    expect(newWeight.name).toEqual('')
    expect(newWeight.description).toEqual('')
    expect(newWeight.profileWeights).toEqual([])
    expect(newWeight._new).toEqual(true)
  })

  it('handles updating a weight name', async () => {
    const weight2: Weight = {
      id: 8481,
      name: 'Weight 2',
      description: 'Description',
      profileWeights: []
    }
    const weight3: Weight = {
      id: 91048,
      name: 'Weight 3',
      description: 'Description',
      profileWeights: []
    }
    rubric.weights.push(weight2)
    rubric.weights.push(weight3)

    const { user, findAllByLabelText } = render()

    const nameInputs = await findAllByLabelText('Name')
    expect(nameInputs.length).toEqual(4) // rubric + 3 weights
    const middleWeightNameInput = nameInputs[2]

    await user.type(middleWeightNameInput, 'X')

    expect(onRubricChange).toHaveBeenCalledWith({
      ...rubric,
      weights: [
        rubric.weights[0],
        {
          ...rubric.weights[1],
          name: `${rubric.weights[1].name}X`
        },
        rubric.weights[2]
      ]
    })
  })
  it('handles updating a weight description', async () => {
    const weight2: Weight = {
      id: 8481,
      name: 'Weight 2',
      description: 'Description',
      profileWeights: []
    }
    const weight3: Weight = {
      id: 91048,
      name: 'Weight 3',
      description: 'Description',
      profileWeights: []
    }
    rubric.weights.push(weight2)
    rubric.weights.push(weight3)

    const { user, findAllByLabelText } = render()

    const descriptionInputs = await findAllByLabelText('Description')
    expect(descriptionInputs.length).toEqual(3) // 3 weights
    const middleWeightDescriptionInput = descriptionInputs[1]

    await user.type(middleWeightDescriptionInput, 'X')

    expect(onRubricChange).toHaveBeenCalledWith({
      ...rubric,
      weights: [
        rubric.weights[0],
        {
          ...rubric.weights[1],
          description: `${rubric.weights[1].description}X`
        },
        rubric.weights[2]
      ]
    })
  })

  describe('on submit', () => {
    it('validates presence of name', async () => {
      rubric.name = ''

      const { user, findAllByRole } = render()
      const alertMock = jest.spyOn(window, 'alert').mockImplementation()

      const buttons = await findAllByRole('button')
      expect(buttons.length).toEqual(2)

      const submitButton = buttons[1]
      await user.click(submitButton)
      expect(alertMock).toHaveBeenCalledTimes(1)
    })

    it('peels the id out of new weights', async () => {
      rubric.weights.push({
        id: 748291041,
        name: 'Newly Created Weight',
        description: 'Description',
        profileWeights: [],
        _new: true
      })

      const { user, findAllByRole } = render()
      const buttons = await findAllByRole('button')
      expect(buttons.length).toEqual(2)

      const submitButton = buttons[1]
      await user.click(submitButton)
      expect(onSubmit).toHaveBeenCalledWith({
        ...rubric,
        weights: [
          rubric.weights[0],
          {
            name: rubric.weights[1].name,
            description: rubric.weights[1].description,
            profileWeights: [],
            _new: true
          }
        ],
        authorId: author.id
      })
    })
  })
})
