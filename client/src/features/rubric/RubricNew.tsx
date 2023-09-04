import React, {useState} from 'react';
import {createRubric, Rubric} from "./rubricSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {useNavigate} from "react-router-dom";
import {selectLoggedInAs} from "../profile/profileSlice";
import RubricForm from "./RubricForm";

const RubricNew = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const author = useAppSelector(selectLoggedInAs)

  const [rubric, setRubric] = useState<Rubric>({name: '', weights: [{
      id: 0,
      name: '',
      description: '',
      _new: true,
    }]})

  const handleSubmit = async (newRubric: Rubric) => {
    const response = await dispatch(createRubric(newRubric))
    navigate(`/rubrics/edit/${(response.payload as Rubric).id}`)
  }

  return author ? (
    <>
      <header><h1>Create a Rubric</h1></header>
      <RubricForm
        author={author}
        rubric={rubric}
        onRubricChange={setRubric}
        onSubmit={handleSubmit}
      />
    </>
  ) : (
    <div>
      Must be logged in to create a rubric.
    </div>
  )
}

export default RubricNew
