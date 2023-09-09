import React from 'react'
import { type Rubric, type Weight } from './rubricSlice'
import { type Profile } from '../profile/profileSlice'

interface RubricFormProperties {
  author: Profile
  rubric: Rubric
  onRubricChange: (rubric: Rubric) => void
  onSubmit: (rubric: Rubric) => void
}

let incrementor = new Date().getTime()

const RubricForm = ({
  author,
  rubric,
  onRubricChange,
  onSubmit
}: RubricFormProperties) => {
  const handleRubricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name
    const value = e.target.value

    onRubricChange({
      ...rubric,
      [field]: value
    })
  }

  const handleWeightChange = (weight: Weight, e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name
    const value = e.target.value

    const existingWeights = rubric.weights
    const index = existingWeights.findIndex((w) => w.id === weight.id)
    const slicedWeights = existingWeights.slice(0, index).concat([{
      ...weight,
      [field]: value
    }]).concat(existingWeights.slice(index + 1))

    onRubricChange({
      ...rubric,
      weights: slicedWeights
    })
  }

  const handleAddWeight = () => {
    const emptyWeight: Weight = {
      id: incrementor++,
      name: '',
      description: '',
      profileWeights: [],
      _new: true
    }

    onRubricChange({
      ...rubric,
      weights: rubric.weights.concat([emptyWeight])
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!rubric.name) {
      alert('Rubric needs a name')
    } else {
      const fixedWeights = rubric.weights.map((weight) => {
        if (weight._new) {
          const { id: _, ...attributes } = weight
          return attributes
        } else {
          return weight
        }
      })
      onSubmit({
        ...rubric,
        weights: fixedWeights,
        authorId: author.id
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor='rubric:name'>Name</label>
        <input id='rubric:name' type='text' name='name' required value={rubric.name} onChange={handleRubricChange}/>
      </div>
      <h3>Weights</h3>
      {rubric.weights.map((weight) => {
        const nameId = `weight:name:${weight.id}`
        const descriptionId = `weight:description:${weight.id}`
        return (
          <div key={weight.id}>
            <label htmlFor={nameId}>Name</label>
            <input
              id={nameId}
              type='text'
              name='name'
              value={weight.name}
              onChange={(e) => { handleWeightChange(weight, e) }}
            />
            <label htmlFor={descriptionId}>Description</label>
            <input
              id={descriptionId}
              type='text'
              name='description'
              value={weight.description}
              onChange={(e) => { handleWeightChange(weight, e) }}
            />
          </div>
        )
      })}
      <div>
        <button type='button' onClick={handleAddWeight}>Add</button>
      </div>
      <div>
        <input type='submit' />
      </div>
    </form>
  )
}

export default RubricForm
