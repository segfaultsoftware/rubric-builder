import React, { useRef } from 'react'

import { type Rubric, RubricVisibility } from '../../types/Rubric'
import { type Weight } from '../../types/Weight'
import { type Profile } from '../../types/Profile'

interface ImportedWeight {
  name: string
  imageUrl?: string
}

const ALLOWED_URL_PROTOCOLS = ['http:', 'https:']

const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString)
    return ALLOWED_URL_PROTOCOLS.includes(url.protocol)
  } catch {
    return false
  }
}

const validateImportedWeights = (data: unknown): { weights: ImportedWeight[], error: string | null } => {
  if (!Array.isArray(data)) {
    return { weights: [], error: 'JSON must be an array of weight objects' }
  }

  const weights: ImportedWeight[] = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (typeof item !== 'object' || item === null) {
      return { weights: [], error: `Item at index ${i} must be an object` }
    }

    const obj = item as Record<string, unknown>
    if (typeof obj.name !== 'string' || obj.name.trim() === '') {
      return { weights: [], error: `Item at index ${i} must have a non-empty "name" field` }
    }

    const weight: ImportedWeight = { name: obj.name }

    if (obj.imageUrl !== undefined) {
      if (typeof obj.imageUrl !== 'string') {
        return { weights: [], error: `Item at index ${i} has an invalid "imageUrl" field` }
      }
      if (obj.imageUrl.trim() !== '' && !isValidUrl(obj.imageUrl)) {
        return { weights: [], error: `Item at index ${i} has an unsafe or invalid URL in "imageUrl"` }
      }
      if (obj.imageUrl.trim() !== '') {
        weight.imageUrl = obj.imageUrl
      }
    }

    weights.push(weight)
  }

  return { weights, error: null }
}

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content !== 'string') return

      let parsed: unknown
      try {
        parsed = JSON.parse(content)
      } catch {
        alert('Invalid JSON file. Please check the file format.')
        return
      }

      const { weights, error } = validateImportedWeights(parsed)
      if (error) {
        alert(error)
        return
      }

      const newWeights: Weight[] = weights.map((w) => ({
        id: incrementor++,
        name: w.name,
        imageUrl: w.imageUrl,
        profileWeights: [],
        _new: true
      }))

      onRubricChange?.({
        ...rubric,
        weights: newWeights
      })
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
        const imageUrlId = `weight:imageUrl:${weight.id}`
        return (
          <div className='row mb-2' key={weight.id}>
            <div className='col-lg-6'>
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
            <div className='col-lg-6'>
              <input
                id={imageUrlId}
                type='text'
                name='imageUrl'
                className='form-control'
                placeholder='Image URL (optional)'
                value={weight.imageUrl ?? ''}
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
              <button className='btn btn-secondary ms-2' type='button' onClick={handleImportClick}>
                <span>Import Weights</span>
                <i className="ms-2 bi bi-upload"></i>
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='.json,application/json'
                onChange={handleFileChange}
                className='d-none'
              />
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
