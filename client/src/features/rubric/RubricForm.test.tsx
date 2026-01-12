import React from 'react'

import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '../../utils/test-utils'
import RubricForm from './RubricForm'
import { type Rubric, RubricVisibility } from '../../types/Rubric'
import { type Weight } from '../../types/Weight'
import RubricFactory from '../../factories/RubricFactory'
import WeightFactory from '../../factories/WeightFactory'
import ProfileFactory from '../../factories/ProfileFactory'

describe('RubricForm', () => {
  const author = ProfileFactory.build()
  let rubric: Rubric
  let isViewOnly: boolean = false

  const onRubricChange = jest.fn()
  const onSubmit = jest.fn()

  const render = () => {
    return {
      user: userEvent.setup(),
      ...renderWithProviders(
        <RubricForm
          rubric={rubric}
          author={author}
          onRubricChange={onRubricChange}
          onSubmit={onSubmit}
          isViewOnly={isViewOnly}
        />
      )
    }
  }

  beforeEach(() => {
    isViewOnly = false
    rubric = RubricFactory.build({ name: 'Some Rubric' })
    rubric.weights = [WeightFactory.build()]
  })

  it('renders the existing rubric name and weight info', async () => {
    const { findByDisplayValue } = render()
    expect(await findByDisplayValue('Some Rubric')).toBeInTheDocument()
    expect(await findByDisplayValue('Address')).toBeInTheDocument()
    expect(await findByDisplayValue('Weight 1')).toBeInTheDocument()
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

  it('handles rubric descriptor change', async () => {
    const { user, findAllByLabelText } = render()

    const descriptorInputs = await findAllByLabelText('Descriptor')
    const rubricDescriptorInput = descriptorInputs[0]

    await user.type(rubricDescriptorInput, '!')

    expect(onRubricChange).toHaveBeenCalledWith({
      ...rubric,
      descriptor: 'Address!'
    })
  })

  it('handles adding a new blank weight', async () => {
    const { user, findByText } = render()

    const addButton = await findByText(/Add Weight/)

    await user.click(addButton)

    expect(onRubricChange).toHaveBeenCalledTimes(1)
    const upboundRubric = onRubricChange.mock.lastCall[0]
    expect(upboundRubric.name).toEqual(rubric.name)
    expect(upboundRubric.weights.length).toEqual(2)
    expect(upboundRubric.weights[0]).toEqual(rubric.weights[0])
    const newWeight = upboundRubric.weights[1]
    expect(newWeight.id).toBeGreaterThan(0)
    expect(newWeight.name).toEqual('')
    expect(newWeight.profileWeights).toEqual([])
    expect(newWeight._new).toEqual(true)
  })

  it('handles updating a weight name', async () => {
    const weight2: Weight = {
      id: 8481,
      name: 'Weight 2',
      profileWeights: []
    }
    const weight3: Weight = {
      id: 91048,
      name: 'Weight 3',
      profileWeights: []
    }
    rubric.weights.push(weight2)
    rubric.weights.push(weight3)

    const { user, findAllByPlaceholderText } = render()

    const nameInputs = await findAllByPlaceholderText('Weight Name')
    expect(nameInputs.length).toEqual(3) // 3 weights
    const middleWeightNameInput = nameInputs[1]

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

  it('handles updating a weight image URL', async () => {
    const { user, findAllByPlaceholderText } = render()

    const imageUrlInputs = await findAllByPlaceholderText('Image URL (optional)')
    expect(imageUrlInputs.length).toEqual(1)
    const imageUrlInput = imageUrlInputs[0]

    await user.type(imageUrlInput, 'X')

    expect(onRubricChange).toHaveBeenCalledWith({
      ...rubric,
      weights: [
        {
          ...rubric.weights[0],
          imageUrl: 'X'
        }
      ]
    })
  })

  it('renders existing image URL in the input', async () => {
    rubric.weights[0].imageUrl = 'https://example.com/existing.jpg'

    const { findByDisplayValue } = render()

    expect(await findByDisplayValue('https://example.com/existing.jpg')).toBeInTheDocument()
  })

  describe('template checkboxes', () => {
    it('handles the "Is Template?" checkbox', async () => {
      const { user, findByLabelText, queryByLabelText } = render()

      const isTemplateCheckbox = await findByLabelText('Is Template?')
      expect(queryByLabelText('Is System Template?')).not.toBeInTheDocument()

      await user.click(isTemplateCheckbox)

      expect(onRubricChange).toHaveBeenCalledWith({
        ...rubric,
        visibility: RubricVisibility.Template
      })
    })

    describe('when the user is an admin', () => {
      beforeEach(() => {
        author.isAdmin = true
      })

      it('handles the "Is Template?" checkbox', async () => {
        const { user, findByLabelText } = render()

        const isTemplateCheckbox = await findByLabelText('Is Template?')
        const isSystemTemplateCheckbox = await findByLabelText('Is System Template?')
        expect(isTemplateCheckbox).not.toBeChecked()
        expect(isSystemTemplateCheckbox).toBeDisabled()
        expect(isSystemTemplateCheckbox).not.toBeChecked()

        await user.click(isTemplateCheckbox)

        expect(onRubricChange).toHaveBeenCalledWith({
          ...rubric,
          visibility: RubricVisibility.Template
        })
      })

      describe('after the Is System Template is checked', () => {
        beforeEach(() => {
          rubric.visibility = RubricVisibility.SystemTemplate
        })

        it('handles unchecking Template', async () => {
          const { user, findByLabelText } = render()

          const isTemplateCheckbox = await findByLabelText('Is Template?')
          const isSystemTemplateCheckbox = await findByLabelText('Is System Template?')
          expect(isTemplateCheckbox).toBeChecked()
          expect(isSystemTemplateCheckbox).not.toBeDisabled()
          expect(isSystemTemplateCheckbox).toBeChecked()

          await user.click(isTemplateCheckbox)

          expect(onRubricChange).toHaveBeenCalledWith({
            ...rubric,
            visibility: RubricVisibility.MembersOnly
          })
        })

        it('handles unchecking System Template', async () => {
          const { user, findByLabelText } = render()

          const isTemplateCheckbox = await findByLabelText('Is Template?')
          const isSystemTemplateCheckbox = await findByLabelText('Is System Template?')
          expect(isTemplateCheckbox).toBeChecked()
          expect(isSystemTemplateCheckbox).not.toBeDisabled()
          expect(isSystemTemplateCheckbox).toBeChecked()

          await user.click(isSystemTemplateCheckbox)

          expect(onRubricChange).toHaveBeenCalledWith({
            ...rubric,
            visibility: RubricVisibility.Template
          })
        })
      })

      describe('after the Is Template is checked', () => {
        beforeEach(() => {
          rubric.visibility = RubricVisibility.Template
        })

        it('handles unchecking template', async () => {
          const { user, findByLabelText } = render()

          const isTemplateCheckbox = await findByLabelText('Is Template?')
          const isSystemTemplateCheckbox = await findByLabelText('Is System Template?')
          expect(isTemplateCheckbox).toBeChecked()
          expect(isSystemTemplateCheckbox).not.toBeDisabled()
          expect(isSystemTemplateCheckbox).not.toBeChecked()

          await user.click(isTemplateCheckbox)

          expect(onRubricChange).toHaveBeenCalledWith({
            ...rubric,
            visibility: RubricVisibility.MembersOnly
          })
        })

        it('handles the "Is System Template?" checkbox', async () => {
          const { user, findByLabelText } = render()

          const isTemplateCheckbox = await findByLabelText('Is Template?')
          const isSystemTemplateCheckbox = await findByLabelText('Is System Template?')
          expect(isTemplateCheckbox).toBeChecked()
          expect(isSystemTemplateCheckbox).not.toBeDisabled()
          expect(isSystemTemplateCheckbox).not.toBeChecked()

          await user.click(isSystemTemplateCheckbox)

          expect(onRubricChange).toHaveBeenCalledWith({
            ...rubric,
            visibility: RubricVisibility.SystemTemplate
          })
        })
      })
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

    it('validates presence of descriptor', async () => {
      rubric.descriptor = ''

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
            profileWeights: [],
            _new: true
          }
        ],
        authorId: author.id
      })
    })
  })

  describe('in view only mode', () => {
    beforeEach(() => {
      isViewOnly = true
    })

    it('disables all inputs', async () => {
      const { findByLabelText, findByPlaceholderText } = render()

      expect(await findByLabelText('Name')).toBeDisabled()
      expect(await findByLabelText('Descriptor')).toBeDisabled()
      expect(await findByPlaceholderText('Weight Name')).toBeDisabled()
    })

    it('does not render action items', async () => {
      const { findByLabelText, queryByLabelText, queryByText } = render()

      expect(await findByLabelText('Name')).toBeInTheDocument()
      expect(queryByLabelText('Is Template?')).not.toBeInTheDocument()
      expect(queryByLabelText('Is System Template?')).not.toBeInTheDocument()
      expect(queryByText(/Add Weight/)).not.toBeInTheDocument()
      expect(queryByText(/Save Rubric/)).not.toBeInTheDocument()
    })
  })
})
