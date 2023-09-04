import React, {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchRubric, Rubric, selectRubric, updateRubric} from "./rubricSlice";
import {useParams} from "react-router-dom";

const RubricEdit = () => {
  const dispatch = useAppDispatch()
  const fetchedRubric = useAppSelector(selectRubric)
  const { rubricId } = useParams()
  const [rubric, setRubric] = useState<Rubric>({name: ''})

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
      dispatch(updateRubric(rubric))
    }
  }

  return (
    <>
      <header><h1>Edit a Rubric</h1></header>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input type='text' name='name' required value={rubric.name} onChange={handleChange} />
        </div>
        <div>
          <input type='submit' />
        </div>
      </form>
    </>
  )
}

export default RubricEdit
