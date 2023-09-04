import React, {useState} from 'react';
import {createRubric, Rubric, Weight} from "./rubricSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {useNavigate} from "react-router-dom";
import {selectLoggedInAs} from "../profile/profileSlice";

let incrementor = new Date().getTime()

const RubricNew = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const author = useAppSelector(selectLoggedInAs)

  const [rubric, setRubric] = useState<Rubric>({name: '', weights: [{
      id: incrementor++,
      name: '',
      description: '',
      _new: true,
    }]})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name
    const value = e.target.value

    setRubric({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rubric.name) {
      alert('Rubric needs a name')
    } else if (!author) {
      alert('Creating a rubric requires you to be logged in')
    } else {
      const fixedWeights = rubric.weights.map((weight) => {
        if (weight._new) {
          const { id: _, ...attributes } = weight
          return attributes
        } else {
          return weight
        }
      })
      const response = await dispatch(createRubric({
        ...rubric,
        weights: fixedWeights,
        authorId: author.id
      }))
      navigate(`/rubrics/edit/${(response.payload as Rubric).id}`)
    }
  }

  return (
    <>
      <header><h1>Create a Rubric</h1></header>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input type='text' name='name' required value={rubric.name} onChange={handleChange}/>
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

export default RubricNew
