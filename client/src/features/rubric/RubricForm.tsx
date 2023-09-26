import React from 'react'

import { type Rubric, RubricVisibility } from '../../types/Rubric'
import { type Weight } from '../../types/Weight'
import { type Profile } from '../../types/Profile'

interface RubricFormProperties {
  author?: Profile
  isViewOnly?: boolean
  rubric: Rubric
  onRubricChange?: (rubric: Rubric) => void
  onSubmit?: (rubric: Rubric) => void
}

let incrementor = new Date().getTime()

const RubricForm = ({
  author,
  isViewOnly,
  rubric,
  onRubricChange,
  onSubmit
}: RubricFormProperties) => {
  isViewOnly = !!isViewOnly

  const handleRubricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name
    const value = e.target.value

    onRubricChange && onRubricChange({
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

    onRubricChange && onRubricChange({
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

    onRubricChange && onRubricChange({
      ...rubric,
      weights: rubric.weights.concat([emptyWeight])
    })
  }

  const handleCheckIsTemplate = () => {
    let newVisibility: RubricVisibility
    if (rubric.visibility === RubricVisibility.Template || rubric.visibility === RubricVisibility.SystemTemplate) {
      newVisibility = RubricVisibility.MembersOnly
    } else {
      newVisibility = RubricVisibility.Template
    }

    onRubricChange && onRubricChange({
      ...rubric,
      visibility: newVisibility
    })
  }

  const handleCheckIsSystemTemplate = () => {
    let newVisibility: RubricVisibility

    if (rubric.visibility === RubricVisibility.SystemTemplate) {
      newVisibility = RubricVisibility.Template
    } else if (rubric.visibility === RubricVisibility.Template) {
      newVisibility = RubricVisibility.SystemTemplate
    } else {
      newVisibility = RubricVisibility.MembersOnly
    }

    onRubricChange && onRubricChange({
      ...rubric,
      visibility: newVisibility
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!rubric.name) {
      alert('Rubric needs a name')
    } else if (!rubric.descriptor) {
      alert('Rubric needs a descriptor')
    } else {
      const fixedWeights = rubric.weights.map((weight) => {
        if (weight._new) {
          const { id: _, ...attributes } = weight
          return attributes
        } else {
          return weight
        }
      })
      onSubmit && onSubmit({
        ...rubric,
        weights: fixedWeights,
        authorId: author?.id
      })
    }
  }

  const renderTemplateCheckboxes = () => {
    return (
      <>
        <div className='row mb-3 text-end'>
          <label className='col-6 col-md-3 form-check-label' htmlFor='rubric:isTemplate'>Is Template?</label>
          <div className='col-1 text-start'>
            <input
              id='rubric:isTemplate'
              className='form-check-input'
              type='checkbox'
              name='isTemplate'
              checked={rubric.visibility === RubricVisibility.Template || rubric.visibility === RubricVisibility.SystemTemplate}
              onChange={handleCheckIsTemplate}
            />
          </div>
          {author?.isAdmin && (
            <>
              <label className='col-6 col-md-4 form-check-label' htmlFor='rubric:isSystemTemplate'>Is System Template?</label>
              <div className='col-1 text-start'>
                <input
                  id='rubric:isSystemTemplate'
                  className='form-check-input'
                  type='checkbox'
                  name='isSystemTemplate'
                  checked={rubric.visibility === RubricVisibility.SystemTemplate}
                  disabled={rubric.visibility === RubricVisibility.MembersOnly}
                  onChange={handleCheckIsSystemTemplate}
                />
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='row mb-3 text-md-end'>
        <label className='col-lg-3 col-form-label' htmlFor='rubric:name'>Name</label>
        <div className='col-lg-9'>
          <input
            id='rubric:name'
            className='form-control'
            type='text'
            name='name'
            placeholder='Rubric Name'
            required
            value={rubric.name}
            onChange={handleRubricChange}
            disabled={isViewOnly}
          />
        </div>
      </div>
      <div className='row mb-3 text-md-end'>
        <label className='col-lg-3 col-form-label' htmlFor='rubric:descriptor'>Descriptor</label>
        <div className='col-lg-9'>
          <input
            id='rubric:descriptor'
            className='form-control'
            type='text'
            name='descriptor'
            placeholder='Descriptor (e.g. "Address" for a Homebuying Rubric)'
            required
            value={rubric.descriptor}
            onChange={handleRubricChange}
            disabled={isViewOnly}
          />
        </div>
      </div>
      {!isViewOnly && renderTemplateCheckboxes()}
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
                disabled={isViewOnly}
              />
            </div>
          </div>
        )
      })}
      {!isViewOnly && (
        <>
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
        </>
      )}
    </form>
  )
}

export default RubricForm
