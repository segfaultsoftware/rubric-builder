import React, {useState} from 'react';
import {createRubric, Rubric} from "./rubricSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {useNavigate} from "react-router-dom";
import {selectLoggedInAs} from "../profile/profileSlice";

const RubricNew = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const author = useAppSelector(selectLoggedInAs)

  const [rubric, setRubric] = useState<Rubric>({name: ''})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name
    const value = e.target.value

    setRubric({
      ...rubric,
      [field]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rubric.name) {
      alert('Rubric needs a name')
    } else if (!author) {
      alert('Creating a rubric requires you to be logged in')
    } else {
      const response = await dispatch(createRubric({
        ...rubric,
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
        <div>
          <input type='submit' />
        </div>
      </form>
    </>
  )
}

export default RubricNew
