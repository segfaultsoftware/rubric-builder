import React, {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchRubric, Rubric, selectRubric, updateRubric, Weight} from "./rubricSlice";
import {useParams} from "react-router-dom";

let incrementor = new Date().getTime()

const RubricEdit = () => {
  const dispatch = useAppDispatch()
  const fetchedRubric = useAppSelector(selectRubric)
  const { rubricId } = useParams()
  const [rubric, setRubric] = useState<Rubric>({name: '', weights: []})

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [])

  useEffect(() => {
    if (fetchedRubric) {
      setRubric(fetchedRubric)
    }
  }, [fetchedRubric])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name
    const value = e.target.value

    setRubric({
      ...rubric,
      [field]: value
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
      dispatch(updateRubric({
        ...rubric,
        weights: fixedWeights
      }))
    }
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

    setRubric({
      ...rubric,
      weights: slicedWeights
    })
  }
  const handleAddWeight = () => {
    const emptyWeight: Weight = { id: incrementor++, name: '', description: '', _new: true }
    setRubric({
      ...rubric,
      weights: rubric.weights.concat([emptyWeight])
    })
  }

  return (
    <>
      <header><h1>Edit a Rubric</h1></header>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input type='text' name='name' required value={rubric.name} onChange={handleChange} />
        </div>
        <h3>Weights</h3>
        {rubric.weights.map((weight) => {
          return (
            <div key={weight.id}>
              <label>Name</label>
              <input
                type='text'
                name='name'
                value={weight.name}
                onChange={(e) => handleWeightChange(weight, e)}
              />
              <label>Description</label>
              <input
                type='text'
                name='description'
                value={weight.description}
                onChange={(e) => handleWeightChange(weight, e)}
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
    </>
  )
}

export default RubricEdit
