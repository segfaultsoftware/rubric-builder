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
      <div className='row mb-3'>
        <label className='col-lg-2 col-form-label' htmlFor='rubric:name'>Name</label>
        <div className='col-lg-10'>
          <input
            id='rubric:name'
            className='form-control'
            type='text'
            name='name'
            placeholder='Rubric Name'
            required
            value={rubric.name}
            onChange={handleRubricChange}
          />
        </div>
      </div>
      <h3>Weights</h3>
      {rubric.weights.map((weight) => {
        const nameId = `weight:name:${weight.id}`
        return (
          <div className='row mb-2' key={weight.id}>
            <div className='col-lg-12'>
              <input
                id={nameId}
                type='text'
                name='name'
                className='form-control'
                placeholder='Weight Name'
                value={weight.name}
                onChange={(e) => { handleWeightChange(weight, e) }}
              />
            </div>
          </div>
        )
      })}
      <div className='row mb-2'>
        <div className='col-lg-12'>
          <button className='btn btn-primary' type='button' onClick={handleAddWeight}>
            <span>Add Weight</span>
            <i className="ms-2 bi bi-plus-circle-fill"></i>
          </button>
        </div>
      </div>
      <div className='row mb-3'>
        <div className='col-lg-12'>
          <button className='btn btn-primary' type='submit'>Save Rubric</button>
        </div>
      </div>
    </form>
  )
}

export default RubricForm
